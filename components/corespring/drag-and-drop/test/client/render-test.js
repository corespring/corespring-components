describe('corespring:drag-and-drop', function() {

  var testModel, scope, element, container, rootScope;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    "data": {
      "componentType": "corespring-drag-and-drop",
      "title": "Butterfly D&D",
      "correctResponse": {
        "1": ["egg", "pupa"],
        "2": [],
        "3": ["larva"],
        "4": ["adult"]
      },
      "feedback": [
        {
          "feedback": [
          ],
          "landingPlace": "1"
        }
      ],
      "model": {
        "answerArea": "A butterfly first is a <span landing-place id='1' cardinality='ordered' label='Fly' class='inline' />. It is then a <span landing-place id='2' class='inline' label='Sky' />. And then a <span landing-place id='3' class='inline'/>. Finally a <span landing-place id='4' class='inline'/>",
        "choices": [
          {
            "content": "<b>Pupa</b>",
            "id": "pupa"
          },
          {
            "content": "Egg",
            "id": "egg",
            "copyOnDrag": true
          },
          {
            "content": "Larva In The Shell",
            "id": "larva"
          },
          {
            "content": "Adult",
            "id": "adult"
          }
        ],
        "config": {
          "shuffle": true,
          "expandHorizontal": false
        },
        "prompt": "Drag the stages of the butterfly's lifecycle on to the the pods"
      },
      "weight": 1
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('MathJaxService', function() {});
      $provide.value('$modal', {});
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-drag-and-drop-render id='1'></corespring-drag-and-drop-render>")($rootScope.$new());
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });


  describe('drag and drop (legacy)', function() {

    it('answer change handler does not get called initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      var changeHandlerCalled = false;
      container.elements['1'].answerChangedHandler(function(c) {
        changeHandlerCalled = true;
      });

      scope.$digest();
      expect(changeHandlerCalled).toBe(false);
    });

    it('answer change handler gets called when model changes', function() {
      container.elements['1'].setDataAndSession(testModel);
      var changeHandlerCalled = false;
      container.elements['1'].answerChangedHandler(function(c) {
        changeHandlerCalled = true;
      });
      scope.landingPlaceChoices = {
        'choice1': 'apple'
      };
      scope.$digest();
      scope.landingPlaceChoices.choice1 = 'pear';
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });
  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: [['pupa']]
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.landingPlaceChoices[0] = [{id:'pupa'}];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge',function(){
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

});