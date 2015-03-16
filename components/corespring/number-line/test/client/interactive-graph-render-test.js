describe('corespring', function() {

  var testModel, nodeScope, scope, element, container, rootScope;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      "model": {
        "config": {
          "domain": [0, 20],
          "maxNumberOfPoints": 3,
          "tickFrequency": 20,
          "snapPerTick": 2,
          "showMinorTicks": true,
          "initialType": "PF",
          "exhibitOnly": false,
          "availableTypes": {
            "PF": true,
            "LEE": true,
            "LEF": true,
            "LFE": true,
            "LFF": true,
            "REP": true,
            "REN": true,
            "RFP": true,
            "RFN": true
          },
          "initialElements": []
        }
      }
    }
  };

  window.Raphael = function() {
    return {
      rect: function() {
      },
      circle: function() {
        return {drag: function() {
        }, click: function() {
        }, attr: function() {
        }};
      },
      clear: function() {
      },
      path: function() {
        var that = {
          attr: function() {
            return that;
          },
          drag: function() {
          },
          click: function() {
          },
          mousedown: function() {
          }
        };
        return that;
      },
      text: function() {
      }
    };
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('MathJaxService', function() {
      });
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    nodeScope = $rootScope.$new();
    nodeScope.editable = true;
    nodeScope.graphOptions = {};
    element = $compile('<div interactive-graph ngModel="graphModel" responsemodel="responseModel" editable="editable" options="graphOptions"></div>')(nodeScope);
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  describe('interactive graph', function() {
    it('constructs', function() {
      expect(element.html().length).toBeGreaterThan(0);
    });

    it('resets the graph on model change', function() {
      spyOn(scope, 'resetGraph');
      nodeScope.graphModel = testModel.data.model;
      scope.$digest();
      expect(scope.resetGraph).toHaveBeenCalled();
    });

    describe('adding new element', function() {
      it('adds point on axis position', function() {
        nodeScope.graphModel = testModel.data.model;
        nodeScope.responseModel = {};
        scope.$digest();
        scope.addElement(3, "PF");
        scope.addElement(4, "PF");
        expect(nodeScope.responseModel).toEqual([
          { type: 'point', pointType: 'full', domainPosition: 3, rangePosition: 0 },
          { type: 'point', pointType: 'full', domainPosition: 4, rangePosition: 0 }
        ]);
      });

      it('points on same domain position get stacked on each other', function() {
        nodeScope.graphModel = testModel.data.model;
        nodeScope.responseModel = {};
        scope.$digest();
        scope.addElement(3, "PF");
        scope.addElement(3, "PF");
        expect(nodeScope.responseModel).toEqual([
          { type: 'point', pointType: 'full', domainPosition: 3, rangePosition: 0 },
          { type: 'point', pointType: 'full', domainPosition: 3, rangePosition: 1 }
        ]);
      });

      it('points on same domain position get stacked on each other', function() {
        nodeScope.graphModel = testModel.data.model;
        nodeScope.responseModel = {};
        scope.$digest();
        scope.addElement(3, "PF");
        scope.addElement(3, "PF");
        expect(nodeScope.responseModel).toEqual([
          { type: 'point', pointType: 'full', domainPosition: 3, rangePosition: 0 },
          { type: 'point', pointType: 'full', domainPosition: 3, rangePosition: 1 }
        ]);
      });

      it('points go below other interaction types', function() {
        nodeScope.graphModel = testModel.data.model;
        nodeScope.responseModel = {};
        scope.$digest();
        scope.addElement(3, "LEE");
        scope.addElement(3, "PF");
        scope.addElement(3, "PF");
        expect(nodeScope.responseModel).toEqual([
          { type: 'line', domainPosition: 3, rangePosition: 0, size: 1, leftPoint: 'empty', rightPoint: 'empty' },
          { type: 'point', pointType: 'full', domainPosition: 3, rangePosition: 1 },
          { type: 'point', pointType: 'full', domainPosition: 3, rangePosition: 2 }
        ]);
      });
    });

    describe('undo / start over', function() {
      beforeEach(function() {
        var model = _.cloneDeep(testModelTemplate);
        model.data.model.config.initialElements = [
          {
            "type": "point",
            "pointType": "full",
            "domainPosition": 3,
            "rangePosition": 0
          }
        ];
        nodeScope.graphModel = model.data.model;
        nodeScope.responseModel = {};
        scope.$digest();
      });

      it('undo undoes adding point', function() {
        scope.addElement(1, "PF");
        scope.undo();
        scope.$digest();
        expect(nodeScope.responseModel).toEqual([
          {
            "type": "point",
            "pointType": "full",
            "domainPosition": 3,
            "rangePosition": 0
          }
        ]);
      });

      it('undo undoes removing point', function() {
        scope.removeElement({domainPosition: 3, rangePosition: 0, type: 'point'});
        scope.$digest();
        scope.undo();
        scope.$digest();
        expect(nodeScope.responseModel).toEqual([
          {
            "type": "point",
            "pointType": "full",
            "domainPosition": 3,
            "rangePosition": 0
          }
        ]);
      });

      it('undo undoes moving point', function() {
        nodeScope.responseModel[0].domainPosition = 5;
        scope.graph.elements[0].options.onMoveFinished('point', 5);
        scope.$digest();
        scope.undo();
        scope.$digest();
        expect(nodeScope.responseModel).toEqual([
          {
            "type": "point",
            "pointType": "full",
            "domainPosition": 3,
            "rangePosition": 0
          }
        ]);
      });

      it('start over goes back to initial view, if startOverClearsGraph is false', function() {
        scope.startOver();
        scope.$digest();
        expect(nodeScope.responseModel).toEqual([
          {
            "type": "point",
            "pointType": "full",
            "domainPosition": 3,
            "rangePosition": 0
          }
        ]);
      });

      it('start over goes back to blank state, if startOverClearsGraph is true', function() {
        nodeScope.graphOptions.startOverClearsGraph = true;
        scope.$digest();
        scope.startOver();
        scope.$digest();
        expect(nodeScope.responseModel).toEqual([]);
      });

    });

  });

});
