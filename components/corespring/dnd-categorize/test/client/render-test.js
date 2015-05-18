describe('corespring:dnd-categorize', function() {

  var testModel, scope, rootScope, container, element;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      "model": {
        "categories": [
          {
            "id": "cat_1",
            "label": "Category 1"
          },
          {
            "id": "cat_2",
            "label": "Category 2"
          }
        ],
        "choices": [
          {
            "id": "choice_1",
            "label": "a",
            "moveOnDrag": false
          },
          {
            "id": "choice_2",
            "label": "b",
            "moveOnDrag": false
          }
        ],
        "config": {
          "shuffle": false,
          "answerAreaPosition": "below",
          "categoriesPerRow" : 2,
          "choicesPerRow" : 2
        }
      }
    },
    session: {}
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-dnd-categorize-render id='1'></corespring-dnd-categorize-render>")($rootScope.$new());
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });

  describe('setDataAndSession', function(){
    it('should set the answers from the session', function(){
      testModel.session = {
        answers: {
          cat_1: ['choice_1']
        }
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(scope.renderModel.categories[0].choices[0].model.id).toEqual('choice_1');
    });
  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: {
          cat_1: ['choice_1']
        }
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.renderModel.categories[0].choices = [{model:{id:'choice_1'}}];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge',function(){
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

});
