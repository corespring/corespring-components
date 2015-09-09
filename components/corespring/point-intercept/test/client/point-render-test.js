describe('corespring', function() {

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
      "componentType": "corespring-point-intercept",
      "title": "Point interaction sample",
      "weight": 1,
      "correctResponse": [
        "0,6",
        "-3,0"
      ],
      "feedback": {
        "correctFeedbackType": "default",
        "incorrectFeedbackType": "default",
        "partialFeedbackType": "default"
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

    element = $compile("<corespring-point-intercept-render id='1'></corespring-point-intercept-render>")($rootScope.$new());
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

    it('graph outline has incorrect color if incorrect answer is submitted', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({correctness: 'incorrect', feedback: 'not good'});
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({ graphStyle : { borderColor : '#EC971F', borderWidth : '2px' }, pointsStyle : '#EC971F' });
    });

    it('graph outline has correct color if correct answer is submitted', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({correctness: 'correct', feedback: 'good'});
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({ graphStyle : { borderColor : '#3c763d', borderWidth : '2px' }, pointsStyle : '#3c763d' });
    });

    it('graph outline has warning color if no answer is submitted', function() {
      container.elements[1].setDataAndSession(testModel);
      scope.$digest();
      spyOn(scope, 'graphCallback');
      container.elements[1].setResponse({correctness: 'warning', feedback: 'good'});
      scope.$digest();
      expect(scope.graphCallback).toHaveBeenCalledWith({ graphStyle : { borderColor : '#999', borderWidth : '2px' }, pointsStyle : '#999' });
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
      testModel.session = {
        answers: ["0.1,0.6"]
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.pointResponse = ["0.1,0.6"];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge',function(){
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

});
