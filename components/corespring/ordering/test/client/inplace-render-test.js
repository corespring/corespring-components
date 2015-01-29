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
            "shuffle": true
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

    it('defaults to inplace ordering', function() {
      container.elements['1'].setDataAndSession(verticalModel);
      scope.$digest();
      expect($(element).find('.view-ordering').length).toBeGreaterThan(0);
    });

    describe('inplace ordering', function() {
      it('constructs', function() {
        expect(element.html()).toBeDefined();
      });

      describe('vertical layout', function() {
        it('renders by default', function() {
          container.elements['1'].setDataAndSession(verticalModel);
          scope.$digest();
          expect($(element).find('.vertical').length).toBeGreaterThan(0);
          expect($(element).find('.horizontal').length).toBe(0);
        });

        it('correct answer and show correct answer button are not visible before submitting', function() {
          container.elements['1'].setDataAndSession(verticalModel);
          scope.$digest();
          expect($(element).find('.show-correct-button').hasClass('ng-hide')).toBe(true);
          expect($(element).find('.correct-answer').hasClass('ng-hide')).toBe(true);
        });

        it('show correct answer button are visible after submitting', function() {
          container.elements['1'].setDataAndSession(verticalModel);
          scope.$digest();
          container.elements['1'].setResponse({correctness: 'incorrect', correctResponse: ['a','b','c','d']});
          scope.$digest();
          expect($(element).find('.show-correct-button').hasClass('ng-hide')).toBe(false);
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
          console.log(horizontalModel);
          container.elements['1'].setDataAndSession(horizontalModel);
          scope.$digest();
          container.elements['1'].setResponse({correctness: 'incorrect', correctResponse: ['a','b','c','d']});
          scope.$digest();
          expect($(element).find('.see-answer-panel').hasClass('ng-hide')).toBe(false);
        });

      });

    });
  });
});
