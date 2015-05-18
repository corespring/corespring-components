describe('corespring:number-line:interactive-graph-render', function() {

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
          "domain": [-10, 10],
          "maxNumberOfPoints": 4,
          "tickFrequency": 10,
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
    var mockRaphaelObject = function() {
      var that = {
        attr: function() {
          return that;
        },
        drag: function() {
          return that;
        },
        click: function() {
          return that;
        },
        mousedown: function() {
          return that;
        }
      };
      return that;
    };

    return {
      rect: mockRaphaelObject,
      circle: mockRaphaelObject,
      clear: function() {},
      path: mockRaphaelObject,
      text: mockRaphaelObject
    };
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('MathJaxService', function() {});
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
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 0
        },
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 4,
          rangePosition: 0
        }
        ]);
    });

    it('non intersecting points go on the same plane', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(4, "PF");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 0
        },
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 4,
          rangePosition: 0
        }
        ]);
    });

    it('point intersecting with point goes above', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(3, "PF");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 0
        },
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 1
        }
        ]);
    });

    it('point intersecting with line goes above', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "LEE");
      scope.addElement(3, "PF");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'line',
          domainPosition: 3,
          rangePosition: 0,
          size: nodeScope.responseModel[0].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        },
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 1
        }
        ]);
    });

    it('point intersecting with ray goes above', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "RFP");
      scope.addElement(4, "PF");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'ray',
          domainPosition: 3,
          rangePosition: 0,
          pointType: 'full',
          direction: 'positive'
        },
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 4,
          rangePosition: 1
        }
        ]);
    });

    it('non intersecting lines go on the same plane', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(6, "LEE");
      scope.addElement(3, "LEE");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'line',
          domainPosition: 6,
          rangePosition: 0,
          size: nodeScope.responseModel[0].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        },
        {
          type: 'line',
          domainPosition: 3,
          rangePosition: 0,
          size: nodeScope.responseModel[1].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        }
        ]);
    });

    it('line intersecting with point goes above', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(3, "LEE");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 0
        },
        {
          type: 'line',
          domainPosition: 3,
          rangePosition: 1,
          size: nodeScope.responseModel[1].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        }

        ]);
    });

    it('line intersecting with line goes above', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(4, "LEE");
      scope.addElement(3, "LEE");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'line',
          domainPosition: 4,
          rangePosition: 0,
          size: nodeScope.responseModel[0].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        },
        {
          type: 'line',
          domainPosition: 3,
          rangePosition: 1,
          size: nodeScope.responseModel[1].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        }
        ]);
    });

    it('line intersecting with ray goes above', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(1, "RFP");
      scope.addElement(3, "LEE");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'ray',
          domainPosition: 1,
          rangePosition: 0,
          pointType: 'full',
          direction: 'positive'
        },
        {
          type: 'line',
          domainPosition: 3,
          rangePosition: 1,
          size: nodeScope.responseModel[1].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        }
        ]);
    });

    it('non intersecting lines go on the same plane', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "RFP");
      scope.addElement(2, "RFN");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'ray',
          domainPosition: 3,
          rangePosition: 0,
          pointType: 'full',
          direction: 'positive'
        },
        {
          type: 'ray',
          domainPosition: 2,
          rangePosition: 0,
          pointType: 'full',
          direction: 'negative'
        }
        ]);
    });

    it('ray intersecting with point goes above', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(1, "RFP");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 0
        },
        {
          type: 'ray',
          domainPosition: 1,
          rangePosition: 1,
          pointType: 'full',
          direction: 'positive'
        }
        ]);
    });

    it('ray intersecting with line goes above', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "LEE");
      scope.addElement(1, "RFP");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'line',
          domainPosition: 3,
          rangePosition: 0,
          size: nodeScope.responseModel[0].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        },
        {
          type: 'ray',
          domainPosition: 1,
          rangePosition: 1,
          pointType: 'full',
          direction: 'positive'
        }
        ]);
    });

    it('ray intersecting with ray goes above', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "RFP");
      scope.addElement(1, "RFP");
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'ray',
          domainPosition: 3,
          rangePosition: 0,
          pointType: 'full',
          direction: 'positive'
        },
        {
          type: 'ray',
          domainPosition: 1,
          rangePosition: 1,
          pointType: 'full',
          direction: 'positive'
        }
        ]);
    });
  });

  describe('moving elements', function() {
    it('point dragged over point stacks', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(4, "PF");
      scope.$digest();

      nodeScope.responseModel[0].domainPosition = 4;
      scope.graph.elements[0].options.onMoveFinished(nodeScope.responseModel[0]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 4,
          rangePosition: 1
        },
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 4,
          rangePosition: 0
        }
        ]);
    });

    it('point dragged over line stacks', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(4, "LEE");
      scope.$digest();

      nodeScope.responseModel[0].domainPosition = 4;
      scope.graph.elements[0].options.onMoveFinished(nodeScope.responseModel[0]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 4,
          rangePosition: 1
        },
        {
          type: 'line',
          domainPosition: 4,
          rangePosition: 0,
          size: nodeScope.responseModel[1].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        }
        ]);
    });

    it('point dragged over ray stacks', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(4, "RFP");
      scope.$digest();

      nodeScope.responseModel[0].domainPosition = 4;
      scope.graph.elements[0].options.onMoveFinished(nodeScope.responseModel[0]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 4,
          rangePosition: 1
        },
        {
          type: 'ray',
          domainPosition: 4,
          rangePosition: 0,
          pointType: 'full',
          direction: 'positive'
        }
        ]);
    });

    it('point dragged to inbetween elements doesnt stack', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(1, "PF");
      scope.addElement(3, "PF");
      scope.addElement(5, "LEE");
      scope.addElement(8, "RFP");
      scope.$digest();

      nodeScope.responseModel[0].domainPosition = 2;
      scope.graph.elements[0].options.onMoveFinished(nodeScope.responseModel[0]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 2,
          rangePosition: 0
        },
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 0
        },
        {
          type: 'line',
          domainPosition: 5,
          rangePosition: 0,
          size: nodeScope.responseModel[2].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        },
        {
          type: 'ray',
          domainPosition: 8,
          rangePosition: 0,
          pointType: 'full',
          direction: 'positive'
        }
        ]);
    });

    it('line dragged over point stacks', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(4, "LEE");
      scope.$digest();

      nodeScope.responseModel[1].domainPosition = 3;
      scope.graph.elements[1].options.onMoveFinished(nodeScope.responseModel[1]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 0
        },
        {
          type: 'line',
          domainPosition: 3,
          rangePosition: 1,
          size: nodeScope.responseModel[1].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        }
        ]);
    });

    it('line dragged over line stacks', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "LEE");
      scope.addElement(5, "LEE");
      scope.$digest();

      nodeScope.responseModel[1].domainPosition = 4;
      scope.graph.elements[1].options.onMoveFinished(nodeScope.responseModel[1]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'line',
          domainPosition: 3,
          rangePosition: 0,
          size: nodeScope.responseModel[0].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        },
        {
          type: 'line',
          domainPosition: 4,
          rangePosition: 1,
          size: nodeScope.responseModel[1].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        }
        ]);
    });

    it('line dragged over ray stacks', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(6, "RFP");
      scope.addElement(3, "LEE");
      scope.$digest();

      nodeScope.responseModel[1].domainPosition = 5;
      scope.graph.elements[1].options.onMoveFinished(nodeScope.responseModel[1]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'ray',
          domainPosition: 6,
          rangePosition: 0,
          pointType: 'full',
          direction: 'positive'
        },
        {
          type: 'line',
          domainPosition: 5,
          rangePosition: 1,
          size: nodeScope.responseModel[1].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        }
        ]);
    });

    it('ray dragged over point stacks', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(4, "RFP");
      scope.$digest();

      nodeScope.responseModel[1].domainPosition = 3;
      scope.graph.elements[1].options.onMoveFinished(nodeScope.responseModel[1]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 0
        },
        {
          type: 'ray',
          domainPosition: 3,
          rangePosition: 1,
          pointType: 'full',
          direction: 'positive'
        }
        ]);
    });

    it('ray dragged over line stacks', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(2, "LEE");
      scope.addElement(4, "RFP");
      scope.$digest();

      nodeScope.responseModel[1].domainPosition = 2;
      scope.graph.elements[1].options.onMoveFinished(nodeScope.responseModel[1]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'line',
          domainPosition: 2,
          rangePosition: 0,
          size: nodeScope.responseModel[0].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        },
        {
          type: 'ray',
          domainPosition: 2,
          rangePosition: 1,
          pointType: 'full',
          direction: 'positive'
        }
        ]);
    });

    it('ray dragged over ray stacks', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "RFN");
      scope.addElement(4, "RFP");
      scope.$digest();

      nodeScope.responseModel[1].domainPosition = 3;
      scope.graph.elements[1].options.onMoveFinished(nodeScope.responseModel[1]);
      scope.$digest();

      expect(nodeScope.responseModel).toEqual([
        {
          type: 'ray',
          domainPosition: 3,
          rangePosition: 0,
          pointType: 'full',
          direction: 'negative'
        },
        {
          type: 'ray',
          domainPosition: 3,
          rangePosition: 1,
          pointType: 'full',
          direction: 'positive'
        }
        ]);
    });
  });

  describe('deleting elements', function() {
    it('deletes from model', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(4, "PF");
      scope.removeElement(nodeScope.responseModel[1]);
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 3,
          rangePosition: 0
        }
        ]);
    });

    it('stacked point falls down', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "PF");
      scope.addElement(4, "PF");
      scope.removeElement(nodeScope.responseModel[0]);
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'point',
          pointType: 'full',
          domainPosition: 4,
          rangePosition: 0
        }
        ]);
    });

    it('stacked line falls down', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "LEE");
      scope.addElement(4, "LEE");
      scope.removeElement(nodeScope.responseModel[0]);
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'line',
          domainPosition: 4,
          rangePosition: 0,
          size: nodeScope.responseModel[0].size,
          leftPoint: 'empty',
          rightPoint: 'empty'
        }
        ]);
    });

    it('stacked ray falls down', function() {
      nodeScope.graphModel = testModel.data.model;
      nodeScope.responseModel = {};
      scope.$digest();
      scope.addElement(3, "RFP");
      scope.addElement(4, "RFP");
      scope.removeElement(nodeScope.responseModel[0]);
      expect(nodeScope.responseModel).toEqual([
        {
          type: 'ray',
          domainPosition: 4,
          rangePosition: 0,
          pointType: 'full',
          direction: 'positive'
        }
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
      scope.removeElement({
        domainPosition: 3,
        rangePosition: 0,
        type: 'point'
      });
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