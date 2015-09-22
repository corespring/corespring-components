describe('corespring:line:render', function() {

  var testModel, scope, rootScope, container, element;

  window.JXG = {
    JSXGraph: {
      initBoard: function() {
        return {
          create: function() {},
          on: function() {}
        };
      }
    },
    Coords: function() { return {scrCoords: [0,0], usrCoords: [0,0]}; }
  };

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      "componentType": "corespring-line",
      "title": "Line interaction sample",
      "weight": 1,
      "correctResponse": [
        "0,6",
        "-3,0"
      ],
      "feedback": {
        "correctFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "model": {
        "config": {
          "graphWidth": "300px",
          "graphHeight": "300px",
          "maxPoints": 2,
          "pointLabels": [
            "label1",
            "label2"
          ],
          "domainLabel": "domain",
          "rangeLabel": "range"
        }
      }
    }
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

    element = $compile("<corespring-line-render id='1'></corespring-line-render>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
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

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    xit('should return false if answer is set initially', function() {
      //Not sure how to set an initial value that
      //makes the component.isAnswerEmpty to return false
      //It seems like the interaction deletes the points in startOver
      testModel.session = {
        answers: {A:{x:0.1,y:0.2}}
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.points = {A:{x:0.1,y:0.2}};
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('instructor data', function() {
    it('should set up graph with correct answer', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      scope.graphCallback = jasmine.createSpy();
      spyOn(container.elements['1'],'setResponse');
      container.elements['1'].setInstructorData({correctResponse: "y=2x+3"});
      rootScope.$digest();
      expect(scope.graphCallback.calls.all()[0].args[0]).toEqual({clearBoard: true});
      expect(scope.graphCallback.calls.all()[1].args[0]).toEqual({drawShape: {curve: jasmine.any(Function)}});
      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({correctness: 'correct'});
    });
  });

  it('should implement containerBridge',function(){
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

  describe('answer change callback', function() {
    var changeHandlerCalled = false;

    beforeEach(function() {
      changeHandlerCalled = false;
      container.elements['1'].answerChangedHandler(function(c) {
        changeHandlerCalled = true;
      });
      container.elements['1'].setDataAndSession(testModel);
      scope.$digest();
      scope.graphCallback = null; //avoid accessing the canvas
    });

    it('does not get called initially', function() {
      expect(changeHandlerCalled).toBe(false);
    });

    it('does get called when a point is selected', function() {
      scope.points = {A:{x:0.1,y:0.2}};
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });

  });
});
