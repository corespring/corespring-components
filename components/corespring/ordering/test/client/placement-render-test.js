describe('corespring:placement ordering', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container;

  var verticalModel, horizontalModel;

  var testModelTemplate = {
    "data": {
      "componentType": "corespring-ordering",
      "title": "",
      "correctResponse": ["c1", "c2"],
      "feedback": {
        "correctFeedbackType": "default",
        "partialFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "allowPartialScoring": true,
      "partialScoring": [
        {
          "numberOfCorrect": 1,
          "scorePercentage": 25
        },
        {
          "numberOfCorrect": 2,
          "scorePercentage": 50
        },
        {
          "numberOfCorrect": 3,
          "scorePercentage": 75
        }
      ],
      "model": {
        "choices": [
          {
            "label": "Apple",
            "labelType": "text",
            "id": "c1",
            "moveOnDrag": true
          },
          {
            "label": "Pear",
            "labelType": "text",
            "id": "c2",
            "moveOnDrag": true
          },
          {
            "label": "Banana",
            "labelType": "text",
            "id": "c3",
            "moveOnDrag": true
          }
        ],
        "config": {
          "shuffle": true,
          "showOrdering": false,
          "choiceAreaLabel": "Choice Label",
          "answerAreaLabel": "Answer Label",
          "placementType": "placement"
        }
      },
      "weight": 1
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      verticalModel = _.cloneDeep(testModelTemplate);
      horizontalModel = _.merge(_.cloneDeep(testModelTemplate), {
        data: {
          model: {
            config: {
              choiceAreaLayout: "horizontal",
              choiceAreaPosition: "above"
            }
          }
        }
      });
      $provide.value('$modal', function() {});
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-ordering-render id='1'></corespring-ordering-render>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
  }));

  function setModelAndDigest(model) {
    container.elements['1'].setDataAndSession(model);
    scope.$digest();
  }

  function setResponseAndDigest(response) {
    container.elements['1'].setResponse(response);
    scope.$digest();
  }

  function setInstructorDataAndDigest(data) {
    container.elements['1'].setInstructorData(data);
    scope.$digest();
  }

  it('constructs', function() {
    expect(element.html()).toBeDefined();
    setModelAndDigest(horizontalModel);
    expect($(element).find('.view-placement-ordering').length).toBeGreaterThan(0);
  });

  it('feedback is hidden', function() {
    setModelAndDigest(verticalModel);
    expect($(element).find('.panel.feedback').length).toBe(0);
  });

  it('response is restored from existing session', function() {
    var modelWithSession = _.cloneDeep(verticalModel);
    modelWithSession.session = {
      answers: ['c1', 'c2']
    };
    setModelAndDigest(modelWithSession);
    expect(_(element.scope().landingPlaceChoices).pluck('id').reject(_.isEmpty).value()).toEqual(modelWithSession.session.answers);
  });


  describe('vertical layout', function() {
    it('renders by default', function() {
      setModelAndDigest(verticalModel);
      expect($(element).find('.vertical').length).toBeGreaterThan(0);
      expect($(element).find('.horizontal').length).toBe(0);
    });

    it('correct answer and show correct answer button are not visible before submitting', function() {
      setModelAndDigest(verticalModel);
      expect($(element).find('.showCorrectVisible').length).toBe(0);
    });

    it('show correct answer button are visible after submitting', function() {
      setModelAndDigest(verticalModel);

      container.elements['1'].setResponse({
        correctness: 'incorrect',
        answer: ['c3', 'c4'],
        correctResponse: ['c1', 'c2']
      });
      scope.$digest();
      expect($(element).find('.show-correct').length).not.toBe(0);
    });

    it('correct answer is visible after submitting an incorrect answer', function() {
      setModelAndDigest(horizontalModel);
      setResponseAndDigest({
        correctness: 'incorrect',
        answer: ['c3', 'c4'],
        correctResponse: ['c1', 'c2']
      });
      expect(element.scope().correctChoices.length).toBe(2);
    });

    it('ordering numbers are hidden', function() {
      setModelAndDigest(verticalModel);
      expect($(element).find('.ordering-number').length).toBe(0);
    });

  });

  describe('horizontal layout', function() {

    it('renders', function() {
      container.elements['1'].setDataAndSession(horizontalModel);

      scope.$digest();
      expect($(element).find('.horizontal').length).toBeGreaterThan(0);
      expect($(element).find('.vertical').length).toBe(0);
    });

    it('correct answer and show correct answer button are not visible before submitting', function() {
      container.elements['1'].setDataAndSession(horizontalModel);
      scope.$digest();
      expect($(element).find('.showCorrectVisible').length).toBe(0);
    });

    it('show correct answer button are visible after submitting', function() {
      container.elements['1'].setDataAndSession(horizontalModel);
      scope.$digest();
      setResponseAndDigest({
        correctness: 'incorrect',
        answer: ['c3', 'c4'],
        correctResponse: ['c1', 'c2']
      });
      expect($(element).find('.showCorrectVisible').length).not.toBe(0);
    });

    it('correct answer is visible after submitting an incorrect answer', function() {
      container.elements['1'].setDataAndSession(horizontalModel);
      scope.$digest();
      setResponseAndDigest({
        correctness: 'incorrect',
        answer: ['c3', 'c4'],
        correctResponse: ['c1', 'c2']
      });
      expect($(element).find('.showCorrectVisible').length).not.toBe(0);
    });

    it('correct answer is not visible after submitting a correct answer', function() {
      setModelAndDigest(horizontalModel);
      setResponseAndDigest({
        correctness: 'correct',
        correctClass: 'correct',
        answer: ['c1', 'c2'],
        correctResponse: ['c1', 'c2']
      });
      expect($(element).find('.showCorrectVisible').length).toBe(0);
    });

    it('ordering numbers are hidden', function() {
      setModelAndDigest(horizontalModel);
      expect($(element).find('.ordering-number').length).toBe(0);
    });

    it('should display choices area above answer area when above is selected as choices area position', function() {
      setModelAndDigest(horizontalModel);
      
      var answerAreaPrev = $(element).find('.placement-areas .answer-area').prev();
      expect(!answerAreaPrev.hasClass('see-answer-area')).toBeTruthy();
    });

    it('should display choices area below answer area when below is selected as choices area position', function() {
      var horizontalModelBelow = _.cloneDeep(horizontalModel);
      horizontalModelBelow.data.model.config.choiceAreaPosition = "below";
      setModelAndDigest(horizontalModelBelow);
      
      var answerAreaNext = $(element).find('.placement-areas .answer-area').next();
      expect(answerAreaNext.hasClass('choice-area') && !answerAreaNext.hasClass('see-answer-area')).toBeTruthy();
    });
  });

  describe('feedback', function() {
    it('correct feedback is shown after submitting the correct answer', function() {
      setModelAndDigest(verticalModel);
      setResponseAndDigest({
        correctness: 'correct',
        correctClass: 'correct',
        feedback: "Correct"
      });
      expect($(element).find('.panel.feedback.correct').length).toBe(1);
      expect(element.scope().feedback).toBe("Correct");
    });
    it('incorrect feedback is shown after submitting an incorrect answer', function() {
      setModelAndDigest(verticalModel);
      setResponseAndDigest({
        correctness: 'incorrect',
        correctClass: 'incorrect',
        feedback: "Incorrect"
      });
      expect($(element).find('.panel.feedback.incorrect').length).toBe(1);
      expect(element.scope().feedback).toBe("Incorrect");
    });
    it('partial feedback is shown after submitting a partially correct answer', function() {
      setModelAndDigest(verticalModel);
      setResponseAndDigest({
        correctness: 'incorrect',
        correctClass: 'partial',
        feedback: "Partial"
      });
      expect($(element).find('.panel.feedback.partial').length).toBe(1);
      expect(element.scope().feedback).toBe("Partial");
    });
  });

  describe('evaluate', function() {
    it('incorrect choices are marked as incorrect', function() {
      setModelAndDigest(verticalModel);
      scope.landingPlaceChoices[0] = {
        id: "c3"
      };
      scope.landingPlaceChoices[1] = {
        id: "c4"
      };
      setResponseAndDigest({
        correctness: 'incorrect',
        correctClass: 'incorrect',
        answer: ['c3', 'c4'],
        correctResponse: ['c1', 'c2']
      });
      expect(element.find('.answer-area-table .incorrect').length).toBe(2);
    });
    it('correct choices are marked as correct', function() {
      setModelAndDigest(verticalModel);
      scope.landingPlaceChoices[0] = {
        id: "c1"
      };
      scope.landingPlaceChoices[1] = {
        id: "c2"
      };
      setResponseAndDigest({
        correctness: 'incorrect',
        correctClass: 'incorrect',
        answer: ['c3', 'c4'],
        correctResponse: ['c1', 'c2']
      });
      expect(element.find('.answer-area-table .correct').length).toBe(2);
    });
  });

  describe('undo / start over', function() {

    it('undo undoes the last step', function() {
      setModelAndDigest(verticalModel);
      scope.landingPlaceChoices = {
        0: 'c1',
        1: 'c2'
      };
      scope.$digest();
      scope.landingPlaceChoices = {
        0: 'c2',
        1: 'c1'
      };
      scope.$digest();
      scope.undo();
      scope.$digest();
      expect(scope.landingPlaceChoices).toEqual({
        0: 'c1',
        1: 'c2'
      });
    });

    it('undo undoes multiple steps', function() {
      setModelAndDigest(verticalModel);
      scope.landingPlaceChoices = {
        0: 'c1',
        1: 'c2',
        2: 'c3',
        3: 'c4'
      };
      scope.$digest();

      scope.landingPlaceChoices = {
        0: 'c2',
        1: 'c1',
        2: 'c3',
        3: 'c4'
      };
      scope.$digest();

      scope.landingPlaceChoices = {
        0: 'c2',
        1: 'c3',
        2: 'c1',
        3: 'c4'
      };
      scope.$digest();

      scope.landingPlaceChoices = {
        0: 'c2',
        1: 'c3',
        2: 'c4',
        3: 'c1'
      };
      scope.$digest();

      scope.undo();
      scope.$digest();
      expect(scope.landingPlaceChoices).toEqual({
        0: 'c2',
        1: 'c3',
        2: 'c1',
        3: 'c4'
      });

      scope.undo();
      scope.$digest();
      expect(scope.landingPlaceChoices).toEqual({
        0: 'c2',
        1: 'c1',
        2: 'c3',
        3: 'c4'
      });

      scope.undo();
      scope.$digest();
      expect(scope.landingPlaceChoices).toEqual({
        0: 'c1',
        1: 'c2',
        2: 'c3',
        3: 'c4'
      });
    });

    it('undo has no effect if there has been no choice swapping', function() {
      setModelAndDigest(verticalModel);
      scope.$digest();
      var originalChoices = scope.landingPlaceChoices;
      scope.undo();
      scope.$digest();
      expect(_.pluck(scope.landingPlaceChoices, 'id')).toEqual(_.pluck(originalChoices, 'id'));
    });

    it('start over restores original state', function() {
      setModelAndDigest(verticalModel);
      var originalChoices = scope.landingPlaceChoices;

      scope.landingPlaceChoices = {
        0: 'c1',
        1: 'c2',
        2: 'c3'
      };
      scope.$digest();

      scope.landingPlaceChoices = {
        0: 'c2',
        1: 'c1',
        2: 'c3'
      };
      scope.$digest();

      scope.landingPlaceChoices = {
        0: 'c2',
        1: 'c3',
        2: 'c1'
      };
      scope.$digest();

      scope.landingPlaceChoices = {
        0: 'c2',
        1: 'c3',
        2: 'c4'
      };
      scope.$digest();

      scope.startOver();
      scope.$digest();
      expect(_.pluck(scope.landingPlaceChoices, 'id')).toEqual(_.pluck(originalChoices, 'id'));
    });
  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      setModelAndDigest(verticalModel);
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      verticalModel.session = {
        answers: ['c1']
      };
      setModelAndDigest(verticalModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      setModelAndDigest(verticalModel);
      scope.landingPlaceChoices[0] = {id:'c1'};
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('instructor data', function () {
    it('should call setResponse with correct response', function () {
      spyOn(container.elements['1'], 'setResponse');
      setModelAndDigest(verticalModel);
      setInstructorDataAndDigest({correctResponse: ['a', 'c', 'b', 'd']});
      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({ correctness: 'correct', correctResponse: [ 'a', 'c', 'b', 'd' ] });
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
      setModelAndDigest(verticalModel);
    });

    it('does not get called initially', function() {
      expect(changeHandlerCalled).toBe(false);
    });

    it('does get called when the answer is changed', function() {
      scope.landingPlaceChoices[0] = 'c1';
      rootScope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });

  });
});