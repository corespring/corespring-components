describe('corespring', function () {

  var testModel, nodeScope, scope, element, container, rootScope;

  var MockComponentRegister = function () {
    this.elements = {};
    this.registerComponent = function (id, bridge) {
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

  window.Raphael = function () {
    return {
      rect: function () {
      },
      circle: function () {
        return {drag: function () {
        }, click: function () {
        }, attr: function () {
        }};
      },
      clear: function () {
      },
      path: function () {
        var that = {
          attr: function () {
            return that;
          },
          drag: function () {
          },
          click: function () {
          },
          mousedown: function () {
          }
        };
        return that;
      },
      text: function () {
      }
    };
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function () {
    module(function ($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('MathJaxService', function () {
      });
    });
  });

  beforeEach(inject(function ($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function (event, id, obj) {
      container.registerComponent(id, obj);
    });

    nodeScope = $rootScope.$new();
    nodeScope.editable = true;
    element = $compile('<div interactive-graph ngModel="graphModel" responsemodel="responseModel" editable="editable"></div>')(nodeScope);
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  describe('interactive graph', function () {
    it('constructs', function () {
      expect(element.html().length).toBeGreaterThan(0);
    });

    it('resets the graph on model change', function () {
      spyOn(scope, 'resetGraph');
      nodeScope.graphModel = testModel.data.model;
      scope.$digest();
      expect(scope.resetGraph).toHaveBeenCalled();
    });

    describe('adding new element', function () {
      it('adds point on axis position', function () {
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

      it('points on same domain position get stacked on each other', function () {
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

      it('points on same domain position get stacked on each other', function () {
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

      it('points go below other interaction types', function () {
        nodeScope.graphModel = testModel.data.model;
        nodeScope.responseModel = {};
        scope.$digest();
        scope.addElement(3, "LEE");
        scope.addElement(3, "PF");
        scope.addElement(3, "PF");
        expect(nodeScope.responseModel).toEqual([
          { type: 'line', domainPosition: 3, rangePosition: 2, size: 1, leftPoint: 'empty', rightPoint: 'empty' },
          { type: 'point', pointType: 'full', domainPosition: 3, rangePosition: 0 },
          { type: 'point', pointType: 'full', domainPosition: 3, rangePosition: 1 }
        ]);
      });
    });

  });

});
