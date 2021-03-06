describe('corespring:ordering-in-place', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container;

  var verticalModel, horizontalModel;

  var testModelTemplate = {
    data: {
      "componentType": "corespring-ordering",
      "title": "Ordering Sample",
      "weight": 1,
      "model": {
        "prompt": "What is the correct order of the letters below?",
        "config": {
          "choiceAreaLabel": "Label",
          "shuffle": false
        },
        "choices": [
          {
            "label": "A",
            "id": "a"
          },
          {
            "label": "B",
            "id": "b"
          },
          {
            "label": "C",
            "id": "c"
          },
          {
            "label": "D",
            "id": "d"
          }
        ]
      }
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      verticalModel = _.cloneDeep(testModelTemplate);
      horizontalModel = _.merge(_.cloneDeep(verticalModel), {
        data: {
          model: {
            config: {
              choiceAreaLayout: "horizontal"
            }
          }
        }
      });
      $provide.value('DragAndDropTemplates', {
        choiceArea: function() {}
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

  it('defaults to inplace ordering', function() {
    setModelAndDigest(verticalModel);
    expect($(element).find('.view-ordering').length).toBeGreaterThan(0);
  });

  describe('inplace ordering', function() {
    it('constructs', function() {
      expect(element.html()).toBeDefined();
    });

    it('feedback is hidden', function() {
      setModelAndDigest(verticalModel);
      expect($(element).find('.panel.feedback').length).toBe(0);
    });

    it('order of choices are restored from existing session (model before 8e92194)', function() {
      var modelWithSession = _.cloneDeep(verticalModel);
      var answers = ['c', 'a', 'b', 'd'];
      modelWithSession.session = {
        answers: {
         choices: _.clone(answers)
        }
      };
      setModelAndDigest(modelWithSession);
      expect(_.pluck(element.scope().local.choices, 'id')).toEqual(answers);
    });

    it('order of choices are restored from existing session (model after 8e92194)', function() {
      var modelWithSession = _.cloneDeep(verticalModel);
      var answers = ['c', 'a', 'b', 'd'];
      modelWithSession.session = {
        answers: _.clone(answers)
      };
      setModelAndDigest(modelWithSession);
      expect(_.pluck(element.scope().local.choices, 'id')).toEqual(answers);
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
          correctResponse: ['a', 'b', 'c', 'd']
        });
        scope.$digest();
        expect($(element).find('.showCorrectVisible').length).not.toBe(0);
      });

      it('correct answer is visible after submitting an incorrect answer', function() {
        setModelAndDigest(horizontalModel);
        setResponseAndDigest({
          correctness: 'incorrect',
          correctClass: 'incorrect',
          correctResponse: ['a', 'b', 'c', 'd']
        });
        expect(element.scope().correctChoices.length).toBe(4);
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
        container.elements['1'].setResponse({
          correctness: 'incorrect',
          correctResponse: ['a', 'b', 'c', 'd']
        });
        scope.$digest();
        expect($(element).find('.showCorrectVisible').length).not.toBe(0);
      });

      it('correct answer is visible after submitting an incorrect answer', function() {
        setModelAndDigest(horizontalModel);
        setResponseAndDigest({
          correctness: 'incorrect',
          correctClass: 'incorrect',
          correctResponse: ['a', 'b', 'c', 'd']
        });
        expect($(element).find('.showCorrectVisible').length).not.toBe(0);
      });

      it('correct answer is not visible after submitting a correct answer', function() {
        setModelAndDigest(horizontalModel);
        setResponseAndDigest({
          correctness: 'correct',
          correctClass: 'correct',
          correctResponse: ['a', 'b', 'c', 'd']
        });
        expect($(element).find('.showCorrectVisible').length).toBe(0);
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
        scope.local.choices = [
          {
            id: 'a'
          },
          {
            id: 'b'
          },
          {
            id: 'c'
          },
          {
            id: 'd'
          }
        ];
        setResponseAndDigest({
          correctness: 'incorrect',
          correctClass: 'partial',
          feedback: "Partial",
          correctResponse: ['a', 'c', 'b', 'd']
        });
        expect(element.find('.container-border .incorrect').length).toBe(2);
      });
      it('correct choices are marked as correct', function() {
        setModelAndDigest(verticalModel);
        scope.local.choices = [
          {
            id: 'a'
          },
          {
            id: 'b'
          },
          {
            id: 'c'
          },
          {
            id: 'd'
          }
        ];
        setResponseAndDigest({
          correctness: 'incorrect',
          correctClass: 'partial',
          feedback: "Partial",
          correctResponse: ['a', 'c', 'b', 'd']
        });
        expect(element.find('.container-border .correct').length).toBe(2);
      });
    });

    describe('undo / start over', function() {

      it('undo undoes the last step', function() {
        setModelAndDigest(verticalModel);
        scope.local.choices = ['c', 'a', 'b', 'd'];
        scope.$digest();
        scope.local.choices = ['a', 'c', 'b', 'd'];
        scope.$digest();
        scope.undo();
        scope.$digest();
        expect(scope.local.choices).toEqual(['c', 'a', 'b', 'd']);
      });

      it('undo undoes multiple steps', function() {
        setModelAndDigest(verticalModel);
        scope.local.choices = ['c', 'a', 'b', 'd'];
        scope.$digest();
        scope.local.choices = ['a', 'c', 'b', 'd'];
        scope.$digest();
        scope.local.choices = ['a', 'b', 'c', 'd'];
        scope.$digest();
        scope.local.choices = ['a', 'b', 'd', 'c'];
        scope.$digest();

        scope.undo();
        scope.$digest();
        expect(scope.local.choices).toEqual(['a', 'b', 'c', 'd']);

        scope.undo();
        scope.$digest();
        expect(scope.local.choices).toEqual(['a', 'c', 'b', 'd']);

        scope.undo();
        scope.$digest();
        expect(scope.local.choices).toEqual(['c', 'a', 'b', 'd']);
      });

      it('undo has no effect if there has been no choice swapping', function() {
        setModelAndDigest(verticalModel);
        scope.$digest();
        var originalChoices = scope.local.choices;
        scope.undo();
        scope.$digest();
        expect(_.pluck(scope.local.choices, 'id')).toEqual(_.pluck(originalChoices, 'id'));
      });

      it('start over restores original state', function() {
        setModelAndDigest(verticalModel);
        scope.$digest();
        var originalChoices = scope.local.choices;
        scope.local.choices = ['c', 'a', 'b', 'd'];
        scope.$digest();
        scope.local.choices = ['a', 'c', 'b', 'd'];
        scope.$digest();
        scope.local.choices = ['a', 'b', 'c', 'd'];
        scope.$digest();
        scope.local.choices = ['a', 'b', 'd', 'c'];
        scope.$digest();

        scope.startOver();
        scope.$digest();
        expect(_.pluck(scope.local.choices, 'id')).toEqual(_.pluck(originalChoices, 'id'));
      });


    });
  });
  describe('isAnswerEmpty', function() {
    it('should return false initially', function() {
      setModelAndDigest(verticalModel);
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is set initially', function() {
      verticalModel.session = {
        answers: ['a', 'b', 'c', 'd']
      };
      setModelAndDigest(verticalModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      setModelAndDigest(verticalModel);
      scope.local.choices.push(scope.local.choices.shift());
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  describe('instructor data', function() {
    it('should call setResponse with correct response', function() {
      spyOn(container.elements['1'], 'setResponse');
      setModelAndDigest(verticalModel);
      setInstructorDataAndDigest({
        correctResponse: ['a', 'c', 'b', 'd']
      });
      expect(container.elements['1'].setResponse).toHaveBeenCalledWith({
        correctness: 'correct',
        correctResponse: ['a', 'c', 'b', 'd']
      });
    });
  });

  it('should implement containerBridge', function() {
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
      scope.local.choices = ['c', 'a', 'b', 'd'];
      rootScope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });
  });

  describe('order of setMode/setResponse', function() {
    var response;

    beforeEach(function() {
      container.elements['1'].setDataAndSession(_.cloneDeep(verticalModel));
      rootScope.$digest();

      response = {
        correctness: 'incorrect',
        correctClass: 'partial',
        feedback: "Partial",
        correctResponse: ['a', 'c', 'b', 'd']
      };
    });

    function assertFeedback() {
      rootScope.$digest();
      expect(element.find('.container-border .correct').length).toBe(2);
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