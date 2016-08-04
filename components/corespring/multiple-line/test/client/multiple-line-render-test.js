describe('corespring:multiple-line:render', function() {

  var testModel, scope, rootScope, container, element, timeout;

  var JXG = {
    JSXGraph: {
      initBoard: function() {
        return {
          currentId: 1,
          create: function(elementType, parents, attributes) {
            if(elementType === 'point'){
              return {
                id: this.currentId,
                name: String.fromCharCode(64 + this.currentId++),
                on: function() {},
                X: function() {},
                Y: function() {},
                setAttribute: function() {}
              };
            }
            return {
              on: function() {},
              X: function() {},
              Y: function() {},
              setAttribute: function() {}
            };
          },
          removeObject: function() {},
          on: function() {}
        };
      }
    },
    Coords: function() { return {scrCoords: [1,0,0], usrCoords: [1,0,0]}; }
  };

  beforeEach(module(function($provide) {
    $provide.value('JXG', JXG);
    window.JXG = JXG;
  }));

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      "title": "Graph Multiple Lines",
      "componentType" : "corespring-multiple-line",
      "weight" : 1,
      "minimumWidth": 500,
      "correctResponse": [],
      "allowPartialScoring": false,
      "partialScoring" : [
        {}
      ],
      "feedback" :  {
        "correctFeedbackType": "default",
        "partialFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "model" : {
        "config": {
          "graphTitle": "",
          "graphWidth": 500,
          "graphHeight": 500,
          "sigfigs": -1,
          "showCoordinates": true,
          "showPointLabels": true,
          "showInputs": true,
          "showAxisLabels": true,
          "showFeedback": true,
          "exhibitOnly": false,
          "domainLabel": "",
          "domainMin": -10,
          "domainMax": 10,
          "domainStepValue": 1,
          "domainSnapValue": 1,
          "domainLabelFrequency": 1,
          "domainGraphPadding": 50,
          "rangeLabel": "",
          "rangeMin": -10,
          "rangeMax": 10,
          "rangeStepValue": 1,
          "rangeSnapValue": 1,
          "rangeLabelFrequency": 1,
          "rangeGraphPadding": 50,
          "lines": [{ "id": 1, "equation": "", "intialLine": "", "label": "", "colorIndex": 0 }]
        }
      }
    }
  };

  var ignoreAngularIds = function(obj){
    var newObj = _.cloneDeep(obj);
    for( var s in newObj){
      if(s === '$$hashKey'){
        delete newObj[s];
      } else if(_.isObject(newObj[s])) {
        newObj[s] = ignoreAngularIds(newObj[s]);
      }
    }
    return newObj;
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('$modal', {});
    })
  );

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-multiple-line-render id='1'></corespring-multiple-line-render>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });

  describe('lock/unlock graph', function() {

    beforeEach(function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      scope.graphCallback = jasmine.createSpy();
    });

    it('should be able to lock graph', function() {
      scope.lockGraph();
      rootScope.$digest();

      expect(scope.graphCallback.calls.all()[0].args[0]).toEqual({lockGraph: true});
      expect(scope.locked).toBe(true);
    });

    it('should be able to lock graph and change the color', function() {
      var color = '#993399';
      scope.lockGraph(color);
      rootScope.$digest();

      expect(scope.graphCallback.calls.all()[0].args[0]).toEqual({lockGraph: true, pointsStyle: color, shapesStyle: color});
      expect(scope.locked).toBe(true);
    });

    it('should be able to unlock graph', function() {
      scope.unlockGraph();
      rootScope.$digest();

      expect(scope.graphCallback.calls.all()[0].args[0]).toEqual({graphStyle: {}, unlockGraph: true});
      expect(scope.locked).toBe(false);
    });
  });

  describe('undo', function() {

    it('should not do anything if the graph is locked or there is no history', function() {
      scope.history = [
        { action: 'move' }, { action: 'add_point' }
      ];
      scope.lockGraph();
      scope.undo();
      rootScope.$digest();

      expect(scope.history.length).toEqual(2);

      scope.history = [];
      scope.undo();
      rootScope.$digest();

      expect(scope.history.length).toEqual(0);
    });

    it('should call pointUpdate when last action is move', function() {
      scope.history = [
        { action: 'move', previousPoint: {index: 2, isSet: true, name: "C", x: 5, y: 4} }
      ];
      scope.pointUpdate = jasmine.createSpy();
      rootScope.$digest();
      scope.undo();

      expect(scope.pointUpdate).toHaveBeenCalled();
    });

    it('should call undoAddPoint when last action is add_point', function() {
      scope.history = [
        { action: 'add_point', previousPoint: {index: 2, isSet: true, name: "C", x: 5, y: 4} }
      ];
      scope.undoAddPoint = jasmine.createSpy();
      rootScope.$digest();
      scope.undo();

      expect(scope.undoAddPoint).toHaveBeenCalled();
    });

    it('should call undoAddLine when last action is add_line', function() {
      scope.history = [
        { action: 'add_line', previousPoint: {index: 2, isSet: true, name: "C", x: 5, y: 4} }
      ];
      scope.undoAddLine = jasmine.createSpy();
      rootScope.$digest();
      scope.undo();

      expect(scope.undoAddLine).toHaveBeenCalled();
    });

    it('should call undoRemoveLine when last action is remove_line', function() {
      scope.history = [
        { action: 'remove_line',
          line: {
            colorIndex: 1,
            equation: "1x+2",
            id: 2,
            isSet: true,
            name: "Line 2",
            points: {
              A: { index: 2, isSet: true, name: "C", x: 0, y: 2 },
              B: { index: 3, isSet: true, name: "D", x: 1, y: 3 }
            }
          }
        }
      ];
      scope.undoRemoveLine = jasmine.createSpy();
      rootScope.$digest();
      scope.undo();

      expect(scope.undoRemoveLine).toHaveBeenCalled();
    });
  });

  describe('startOver', function() {

    it('should clean the graph and properties when startOver is called', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.graphCallback = jasmine.createSpy();
      scope.startOver();
      rootScope.$digest();

      // graph
      expect(scope.graphCallback.calls.all()[0].args[0]).toEqual({clearBoard: true});

      // properties
      expect(scope.plottedPoint).toEqual({});
      expect(scope.pointsPerLine).toEqual({});
      expect(scope.history).toEqual([]);

      // scope.lines
      expect(scope.lines.length).toBe(1);
      expect(ignoreAngularIds(scope.lines)).toEqual([{
        id: 1,
        name: "",
        colorIndex: 0,
        points: { A: { isSet: false }, B: { isSet: false } },
        equation: "",
        isSet: false
      }]);

    });

    it('should reset initial lines when startOver is called', function() {
      var clone = _.cloneDeep(testModel);
      clone.data.model.config.lines = [{ "id": 1, "equation": "x+1", "intialLine": "2x", "label": "X + 1", "colorIndex": 0 }];
      container.elements['1'].setDataAndSession(clone);
      scope.graphCallback = jasmine.createSpy();
      scope.startOver();
      rootScope.$digest();

      expect(scope.graphCallback.calls.all()[0].args[0]).toEqual({clearBoard: true});
      expect(scope.graphCallback.calls.all()[1].args[0]).toEqual({add: {point: {x: 0, y: 0}, triggerCallback: true}});
      expect(scope.graphCallback.calls.all()[2].args[0]).toEqual({add: {point: {x: 1, y: 2}, triggerCallback: true}});
      expect(scope.graphCallback.calls.all().length).toEqual(3);
    });
  });

  describe('feedback', function() {
    it('shows feedback by default', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      container.elements[1].setResponse({correctness: 'incorrect', feedback: 'not good'});
      scope.$digest();

      expect(scope.feedback).toEqual('not good');
      expect(element.find('.feedback-holder').hasClass('ng-hide')).toBe(false);
    });

    it('does not show feedback if showFeedback is false', function() {
      testModel.data.model.config.showFeedback = false;
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      container.elements[1].setResponse({correctness: 'incorrect', feedback: 'not good'});
      scope.$digest();
      expect(scope.feedback).toEqual('not good');
      expect(element.find('.feedback-holder').hasClass('ng-hide')).toBe(true);
    });
  });

  describe('restoring session', function() {
    beforeEach(inject(function($timeout) {
      timeout = $timeout;
    }));

    it('restores state from session when present', function() {
      var model = _.cloneDeep(testModel);
      model.session = {answers: [
        {
          equation: "3x+4",
          id: 1,
          name: 'a'
        },
        {
          equation: "2x+1",
          id: 2,
          name: 'b'
        }
      ]};
      container.elements['1'].setDataAndSession(model);
      scope.graphCallback = function() {};
      timeout.flush();
      expect(scope.config.lines).toEqual([
        {
          id: 1,
          label: 'a',
          intialLine: '3x+4',
          colorIndex: 0
        },
        {
          id: 2,
          label: 'b',
          intialLine: '2x+1',
          colorIndex: 1
        }
      ]);

    });
  });

  describe('isAnswerEmpty', function() {
    beforeEach(inject(function($timeout) {
      timeout = $timeout;
    }));

    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });

    it('should return false if answer is set initially', function() {
      testModel.data.model.config.lines = [{ "id": 1, "equation": "x", "intialLine": "2x", "label": "", "colorIndex": 0 }];
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      timeout(function() {
        expect(container.elements['1'].isAnswerEmpty()).toBe(false);
      }, 100);
      timeout.flush();
    });

    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.lines = [{ "id": 1, "equation": "x", "label": "" }];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('instructor data', function() {
    it('should set up graph with correct answer', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      scope.graphCallback = jasmine.createSpy();
      spyOn(container.elements['1'],'setResponse');
      container.elements['1'].setInstructorData({ correctResponse: [
        {
          "id": 1,
          "equation": "4x",
          "label": "Line 1"
        },
        {
          "id": 2,
          "equation": "x + 2",
          "label": "Line 2"
        }
      ]});
      rootScope.$digest();
      expect(scope.graphCallback.calls.all()[0].args[0]).toEqual({clearBoard: true});
      expect(scope.graphCallback.calls.all()[1].args[0]).toEqual({drawShape: {label: 'Line 1', color: '#3c763d', curve: jasmine.any(Function)}});
      expect(scope.graphCallback.calls.all()[1].args[0]).toEqual({drawShape: {color: '#3c763d', label: 'Line 1', curve: jasmine.any(Function)}});
    });
  });

  it('should implement containerBridge',function(){
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });


  describe('order of setMode/setResponse', function() {
    var response;

    beforeEach(function() {
      container.elements['1'].setDataAndSession(_.cloneDeep(testModel));
      rootScope.$digest();

      response = {correctness: 'incorrect', feedback: 'not good'};
    });

    function assertFeedback() {
      rootScope.$digest();
      expect(scope.feedback).toEqual('not good');
    }

    it('should work when setMode is called before setResponse', function() {
      container.elements['1'].setMode('evaluate');
      container.elements['1'].setResponse(response);
      assertFeedback();
    });

    it('should work when setMode is called after setResponse', function() {
      container.elements['1'].setResponse(response);
      container.elements['1'].setMode('evaluate');
      assertFeedback();
    });
  });

});