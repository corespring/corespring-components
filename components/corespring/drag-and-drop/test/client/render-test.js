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
          "feedback": [],
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

  var allCorrectLandingPlaceChoices = {
    "1": [
      {
        "content": "Egg",
        "id": "egg",
        "copyOnDrag": true
      },
      {
        "content": "<b>Pupa</b>",
        "id": "pupa"
      }
    ],
    "2": [],
    "3": [
      {
        "content": "Larva In The Shell",
        "id": "larva"
      }
    ],
    "4": [
      {
        "content": "Adult",
        "id": "adult"
      }
    ]
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('MathJaxService', function() {
      });
      $provide.value('$modal', {});
      $provide.value('Msgr', {});
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
    expect(element).not.toBe(null);
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

  describe('instructor mode', function() {
    it('setting instructor data show the correct answer inline', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.$digest();
      var correctResponse = {
        "1": ["egg", "pupa"],
        "2": [],
        "3": ["larva"],
        "4": ["adult"]
      };
      container.elements['1'].setInstructorData({correctResponse: correctResponse});
      expect(scope.landingPlaceChoices).toEqual(allCorrectLandingPlaceChoices);
      expect(scope.correctResponse).toEqual(correctResponse);
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
      scope.landingPlaceChoices[0] = [{id: 'pupa'}];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge', function() {
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

  describe('showSolution', function(){
    beforeEach(function(){
      container.elements['1'].setDataAndSession(testModel);
    });
    describe('with answer', function(){
      it('should be false, when answer is correct', function(){
        container.elements['1'].setResponse({correctness: 'correct'});
        expect(scope.showSolution).toBe(false);
      });
      it('should be true, when answer is incorrect', function(){
        container.elements['1'].setResponse({correctness: 'incorrect'});
        expect(scope.showSolution).toBe(true);
      });
    });
    describe('without answer', function(){
      it('should be false, when answer is correct', function(){
        container.elements['1'].setResponse({correctness: 'correct', emptyAnswer: true});
        expect(scope.showSolution).toBe(false);
      });
      it('should be false, when answer is incorrect', function(){
        container.elements['1'].setResponse({correctness: 'incorrect', emptyAnswer: true});
        expect(scope.showSolution).toBe(false);
      });
    });

  });

  describe('order of setMode/setResponse', function() {
    var response;

    beforeEach(function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();

      response = {
        correctness: 'incorrect',
        feedback: {}
      };
    });

    function assertFeedback() {
      rootScope.$digest();
      expect(scope.feedback).toBeTruthy();
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