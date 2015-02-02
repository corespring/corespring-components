describe('corespring', function() {

  describe('ordering', function() {

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
            {"label": "A", "id": "a"},
            {"label": "B", "id": "b"},
            {"label": "C", "id": "c"},
            {"label": "D", "id": "d"}
          ]
        }
      }
    };

    beforeEach(angular.mock.module('test-app'));

    beforeEach(function() {
      module(function($provide) {
        verticalModel = _.cloneDeep(testModelTemplate);
        horizontalModel = _.merge(_.cloneDeep(verticalModel), {data: {model: {config: {choiceAreaLayout: "horizontal"}}}});
        $provide.value('DragAndDropTemplates', {
          choiceArea: function() {
          }
        });
        $provide.value('$modal', function() {
        });
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

      it('order of choices are restored from existing session', function() {
        var modelWithSession = _.cloneDeep(verticalModel);
        modelWithSession.session = {
          answers: ['c', 'a', 'b', 'd']
        };
        setModelAndDigest(modelWithSession);
        expect(_.pluck(element.scope().local.choices, 'id')).toEqual(modelWithSession.session.answers);
      });

      it('change handler is called when answer changes', function() {
        var mock = {handler: function() {
        } };
        spyOn(mock, 'handler');

        container.elements['1'].answerChangedHandler(mock.handler);

        setModelAndDigest(verticalModel);
        scope.local.choices = ['c', 'a', 'b', 'd'];
        scope.$apply();
        expect(mock.handler).toHaveBeenCalled();
      });


      describe('vertical layout', function() {
        it('renders by default', function() {
          setModelAndDigest(verticalModel);
          expect($(element).find('.vertical').length).toBeGreaterThan(0);
          expect($(element).find('.horizontal').length).toBe(0);
        });

        it('correct answer and show correct answer button are not visible before submitting', function() {
          setModelAndDigest(verticalModel);
          expect($(element).find('.show-correct-button').hasClass('ng-hide')).toBe(true);
          expect($(element).find('.correct-answer').hasClass('ng-hide')).toBe(true);
        });

        it('show correct answer button are visible after submitting', function() {
          setModelAndDigest(verticalModel);

          container.elements['1'].setResponse({correctness: 'incorrect', correctResponse: ['a', 'b', 'c', 'd']});
          scope.$digest();
          expect($(element).find('.show-correct-button').hasClass('ng-hide')).toBe(false);
        });

        it('correct answer is visible after submitting an incorrect answer', function() {
          setModelAndDigest(horizontalModel);
          setResponseAndDigest({correctness: 'incorrect', correctClass: 'incorrect', correctResponse: ['a', 'b', 'c', 'd']});
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
          expect($(element).find('.see-answer-panel').hasClass('ng-hide')).toBe(true);
        });

        it('show correct answer button are visible after submitting', function() {
          container.elements['1'].setDataAndSession(horizontalModel);
          scope.$digest();
          container.elements['1'].setResponse({correctness: 'incorrect', correctResponse: ['a', 'b', 'c', 'd']});
          scope.$digest();
          expect($(element).find('.see-answer-panel').hasClass('ng-hide')).toBe(false);
        });

        it('correct answer is visible after submitting an incorrect answer', function() {
          setModelAndDigest(horizontalModel);
          setResponseAndDigest({correctness: 'incorrect', correctClass: 'incorrect', correctResponse: ['a', 'b', 'c', 'd']});
          expect($(element).find('.see-answer-panel').hasClass('ng-hide')).toBe(false);
        });

        it('correct answer is not visible after submitting a correct answer', function() {
          setModelAndDigest(horizontalModel);
          setResponseAndDigest({correctness: 'correct', correctClass: 'correct', correctResponse: ['a', 'b', 'c', 'd']});
          expect($(element).find('.see-answer-panel').hasClass('ng-hide')).toBe(true);
        });

      });

      describe('feedback', function() {
        it('correct feedback is shown after submitting the correct answer', function() {
          setModelAndDigest(verticalModel);
          setResponseAndDigest({correctness: 'correct', correctClass: 'correct', feedback: "Correct"});
          expect($(element).find('.panel.feedback.correct').length).toBe(1);
          expect(element.scope().feedback).toBe("Correct");
        });
        it('incorrect feedback is shown after submitting an incorrect answer', function() {
          setModelAndDigest(verticalModel);
          setResponseAndDigest({correctness: 'incorrect', correctClass: 'incorrect', feedback: "Incorrect"});
          expect($(element).find('.panel.feedback.incorrect').length).toBe(1);
          expect(element.scope().feedback).toBe("Incorrect");
        });
        it('partial feedback is shown after submitting a partially correct answer', function() {
          setModelAndDigest(verticalModel);
          setResponseAndDigest({correctness: 'incorrect', correctClass: 'partial', feedback: "Partial"});
          expect($(element).find('.panel.feedback.partial').length).toBe(1);
          expect(element.scope().feedback).toBe("Partial");
        });
      });

      describe('evaluate', function() {
        it('incorrect choices are marked as incorrect', function() {
          setModelAndDigest(verticalModel);
          scope.local.choices = [
            {id: 'a'},
            {id: 'b'},
            {id: 'c'},
            {id: 'd'}
          ];
          setResponseAndDigest({correctness: 'incorrect', correctClass: 'partial', feedback: "Partial", correctResponse: ['a', 'c', 'b', 'd']});
          expect(element.find('.container-border .incorrect').length).toBe(2);
        });
        it('correct choices are marked as correct', function() {
          setModelAndDigest(verticalModel);
          scope.local.choices = [
            {id: 'a'},
            {id: 'b'},
            {id: 'c'},
            {id: 'd'}
          ];
          setResponseAndDigest({correctness: 'incorrect', correctClass: 'partial', feedback: "Partial", correctResponse: ['a', 'c', 'b', 'd']});
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
  });
});
