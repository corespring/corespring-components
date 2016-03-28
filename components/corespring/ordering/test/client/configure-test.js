/*global describe,inject,beforeEach,it,expect,module*/
describe('corespring:ordering:configure', function () {

  "use strict";

  var MockComponentRegister = function () {
    this.elements = {};
    this.registerConfigPanel = function (id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null, scope, container = null, rootScope;

  function createTestModel() {
    return {
      "componentType": "corespring-ordering",
      "correctResponse": [
        "c",
        "a",
        "b"
      ],
      "feedback": {
        "correctFeedbackType": "default",
        "partialFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "model": {
        "config": {
          "shuffle": false,
          "showOrdering": false,
          "choiceAreaLayout": "horizontal",
          "answerAreaLabel": "Place answers here",
          "placementType": "placement"
        },
        "choices": [
          {
            "label": "2",
            "value": "a",
            "id": "a",
            "moveOnDrag": true
          },
          {
            "label": "3",
            "value": "b",
            "id": "b",
            "moveOnDrag": true
          },
          {
            "label": "1",
            "value": "c",
            "id": "c",
            "moveOnDrag": true
          }
        ],
        "correctResponse": [
          "c",
          "a",
          "b"
        ]
      }
    };
  }

  beforeEach(angular.mock.module('test-app'));

  var MockServerLogic = {
    load: function () {
      return {defaults: {}, keys: {}};
    }
  };


  function MockWiggiMathJaxFeatureDef() {
  }

  beforeEach(function () {
    module(function ($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('WiggiMathJaxFeatureDef', MockWiggiMathJaxFeatureDef);
      $provide.value('WiggiLinkFeatureDef', function () {
      });
    });
  });

  beforeEach(inject(function ($compile, $rootScope) {
    scope = $rootScope.$new();
    container = new MockComponentRegister();

    $rootScope.$on('registerConfigPanel', function (ev, id, b) {
      container.registerConfigPanel(id, b);
    });

    $rootScope.registerConfigPanel = function (id, b) {
      container.registerConfigPanel(id, b);
    };
    element = $compile("<div navigator=''><corespring-ordering-configure id='1'></corespring-ordering-configure></div>")(scope);
    element.find('.ordering-config');
    scope = element.scope().$$childHead.$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function () {
    expect(element).not.toBe(null);
  });
  
  it('component is being registered by the container', function () {
    expect(container.elements['1']).not.toBeUndefined();
    expect(container.elements['2']).toBeUndefined();
  });

  describe('correct response', function () {
    it('is set by the order of choices for inplace ordering', function () {
      var testModel = createTestModel();
      testModel.model.config.placementType = 'inPlace';
      delete testModel.correctResponse;
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
      var model = container.elements['1'].getModel();
      expect(model.correctResponse).toEqual(['a','b','c']);
    });
  });

  describe('partialScoring', function () {
    var testModel;

    beforeEach(function(){
      testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
    });

    describe('numberOfCorrectResponses', function(){
      it('should be initialised to the number of choices', function(){
        expect(scope.numberOfCorrectResponses).toBe(3);
      });
      it('should be increased when a choice is added', function(){
        scope.addChoice();
        scope.$digest();
        expect(scope.numberOfCorrectResponses).toBe(4);
      });
      it('should be decreased when a choice is removed', function(){
        scope.removeChoice(testModel.model.choices[0]);
        scope.$digest();
        expect(scope.numberOfCorrectResponses).toBe(2);
      });
    });

    it('should automatically remove additional partial scoring scenarios after removing a correct choice', function () {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
      expect(scope.numberOfCorrectResponses).toEqual(3);
      expect(scope.maxNumberOfScoringScenarios).toEqual(2);
      scope.addScoringScenario();
      expect(scope.fullModel.partialScoring.length).toEqual(2);
      scope.removeChoice(scope.model.choices[0]);
      rootScope.$digest();
      expect(scope.fullModel.partialScoring.length).toEqual(1);
    });
  });

  describe('activate', function() {
    var index = 0;
    var event = {
      stopPropagation: function() {}
    };

    beforeEach(function() {
      spyOn(scope, 'deactivate');
      spyOn(event, 'stopPropagation');
      scope.activate(index, event);
    });

    it('should cancel event', function() {
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should call deactivate on scope', function() {
      expect(scope.deactivate).toHaveBeenCalled();
    });

  });

  describe('math-updated event', function() {
    var activeIndex = 1;

    beforeEach(function() {
      spyOn(scope, 'activate');
      scope.active = _(3).times().map(function(i) {
        return i === activeIndex;
      }).value();
      scope.$emit('math-updated');
    });

    it('should activate the active index', function() {
      expect(scope.activate).toHaveBeenCalledWith(activeIndex);
    });
  });

  describe('addChoice', function(){
    var testModel;

    beforeEach(function(){
      testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      scope.$digest();
    });

    it('should add a choice', function(){
      var numberBefore = testModel.model.choices.length;
      scope.addChoice();
      expect(testModel.model.choices.length).toBe(numberBefore + 1);
    });

    it('should set moveOnDrag to true when removeAllAfterPlacing is true', function(){
      scope.model.config.removeAllAfterPlacing = true;
      scope.addChoice();
      expect(testModel.model.choices.pop().moveOnDrag).toBe(true);
    });

    it('should set moveOnDrag to false when removeAllAfterPlacing is false', function(){
      scope.model.config.removeAllAfterPlacing = false;
      scope.addChoice();
      expect(testModel.model.choices.pop().moveOnDrag).toBe(false);
    });
  });

  describe('removeAllAfterPlacing', function(){
    var testModel;

    beforeEach(function(){
      testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      scope.$digest();
    });

    function setRemoveAllAfterPlacing(value){
      //set the model like the checkbox would do
      testModel.model.config.removeAllAfterPlacing = value;

      //set one choice to have the opposite value so we can proove the action
      testModel.model.choices[0].moveOnDrag = !value;

      //call the onToggle like the checkbox would do
      scope.onToggleRemoveAllAfterPlacing();
      scope.$digest();
    }

    it('should set moveOnDrag=true for all choices when set to true', function(){
      setRemoveAllAfterPlacing(true);

      var resultModel = container.elements['1'].getModel();
      _.forEach(resultModel.model.choices, function(choice){
        expect(choice.moveOnDrag).toBe(true);
      });
    });

    it('should set moveOnDrag=false for all choices when set to false', function(){
      setRemoveAllAfterPlacing(false);

      var resultModel = container.elements['1'].getModel();
      _.forEach(resultModel.model.choices, function(choice){
        expect(choice.moveOnDrag).toBe(false);
      });
    });

    it('should be set to false, when one choice toggles moveOnDrag to false', function(){
      setRemoveAllAfterPlacing(true);
      var choice = testModel.model.choices[0];
      choice.moveOnDrag = false;
      scope.onToggleMoveOnDrag(choice);
      scope.$digest();

      expect(testModel.model.config.removeAllAfterPlacing).toBe(false);
    });

    it('should not change, when one choice toggles moveOnDrag to true', function(){
      setRemoveAllAfterPlacing(false);
      var choice = testModel.model.choices[0];
      choice.moveOnDrag = true;
      scope.onToggleMoveOnDrag(choice);
      scope.$digest();

      expect(testModel.model.config.removeAllAfterPlacing).toBe(false);
    });
  });

});
