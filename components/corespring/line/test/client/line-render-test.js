describe('corespring:line:render', function() {

  var testModel, scope, rootScope, container, element, timeout;

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
      "correctResponse": "y=2x+7",
      "feedback": {
        "correctFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "model": {
        "config": {
          "maxPoints": 2,
          "graphHeight": 500,
          "domainLabel": "x",
          "domainMin": -10,
          "domainMax": 10,
          "domainStepValue": 1,
          "domainSnapValue": 1,
          "domainLabelFrequency": 1,
          "domainGraphPadding": 50,
          "rangeLabel": "y",
          "rangeMin": -10,
          "rangeMax": 10,
          "rangeStepValue": 1,
          "rangeSnapValue": 1,
          "rangeLabelFrequency": 1,
          "rangeGraphPadding": 50,
          "sigfigs": -1,
          "showCoordinates": true,
          "showInputs": true
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
    // beforeEach(inject(function($timeout) {
    //   timeout = $timeout;
    // }));

    // beforeEach(function(done) {
    //   done();
    // });

    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });

    xit('should return false if answer is set initially', function() {
      //Not sure how to set an initial value that
      //makes the component.isAnswerEmpty to return false
      //It seems like the interaction deletes the points in startOver
      testModel.data.model.config.initialCurve = "y=2x+1";
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      timeout(function() {
        expect(container.elements['1'].isAnswerEmpty()).toBe(false);
        // done();
      }, 150);
      timeout.flush();
    });

    it('should return true no line is plotted', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.line.equation = null;
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });

    it('should return false if line is ploted', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.line.equation = "2x+7";
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('restoring session', function() {
    it('restores state from session when present', function() {
      var model = _.cloneDeep(testModel);
      model.session = {answers: "3x+4"};
      container.elements['1'].setDataAndSession(model);
      rootScope.$digest();
      expect(scope.config.initialCurve).toEqual("3x+4");

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

    it('does get called when a line is plotted', function() {
      scope.line.equation = "y=2x";
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });

  });
});
