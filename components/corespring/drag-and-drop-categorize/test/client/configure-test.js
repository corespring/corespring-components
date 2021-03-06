/* global describe, it, beforeEach, inject, module, expect */
describe('corespring:drag-and-drop-categorize:configure', function() {

  "use strict";

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null,
    scope, container = null,
    rootScope;

  function createTestModel() {
    return {
      "componentType": "corespring-drag-and-drop-categorize",
      "correctResponse": {
        "cat_1": ["choice_1", "choice_2", "choice_3"]
      },
      "feedback": {
        "correctFeedbackType": "default",
        "partialFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "allowPartialScoring": true,
      "partialScoring": [{
        "numberOfCorrect": 1,
        "scorePercentage": 25
      }],
      "model": {
        "categories": [{
          "id": "cat_1",
          "hasLabel": true,
          "label": "Category 1",
          "layout": "vertical"
        }],
        "choices": [
          {
            "label": "b",
            "labelType": "text",
            "id": "choice_1"
          },
          {
            "label": "c",
            "labelType": "text",
            "id": "choice_2"
          },
          {
            "label": "d",
            "labelType": "text",
            "id": "choice_3"
          }],
        "config": {
          "shuffle": false,
          "removeTilesOnDrop": true,
          "choiceAreaLayout": "vertical",
          "answerAreaPosition": "below"
        }
      }
    };
  }

  beforeEach(angular.mock.module('test-app'));

  var MockServerLogic = {
    load: function() {
      return {
        defaults: {},
        keys: {}
      };
    }
  };

  function MockWiggiMathJaxFeatureDef() {}

  beforeEach(function() {
    module(function($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('MathJaxService', {
        parseDomForMath: function() {}
      });
      $provide.value('WiggiMathJaxFeatureDef', MockWiggiMathJaxFeatureDef);
      $provide.value('WiggiLinkFeatureDef', function() {});
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    scope = $rootScope.$new();
    container = new MockComponentRegister();

    $rootScope.$on('registerConfigPanel', function(ev, id, b) {
      container.registerConfigPanel(id, b);
    });

    $rootScope.registerConfigPanel = function(id, b) {
      container.registerConfigPanel(id, b);
    };
    element = $compile("<div navigator=''><corespring-drag-and-drop-categorize-configure id='1'></corespring-drag-and-drop-categorize-configure></div>")(scope);
    element = element.find('.drag-and-drop-config-panel');
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toBeDefined();
  });


  it('component is being registered by the container', function() {
    expect(container.elements['1']).not.toBe(undefined);
    expect(container.elements['2']).toBeUndefined();
  });

  describe('partialScoring', function() {
    it('should automatically remove additional partial scoring scenarios after removing a correct choice', function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      expect(scope.numberOfCorrectResponses).toEqual(3);
      expect(scope.maxNumberOfScoringScenarios).toEqual(2);
      scope.addScoringScenario();
      expect(scope.fullModel.partialScoring.length).toEqual(2);
      scope.removeChoice(scope.model.choices[0]);
      rootScope.$digest();
      expect(scope.fullModel.partialScoring.length).toEqual(1);
    });
  });

  describe('removeCategory', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
    });
    it('should have a category in the beginning', function() {
      expect(scope.model.categories.length).toEqual(1);
    });
    it('should remove a category', function() {
      scope.removeCategory(scope.model.categories[0]);
      expect(scope.model.categories.length).toEqual(0);
    });
    it('should remove the category from the correctResponse', function() {
      var cat = scope.model.categories[0];
      expect(scope.fullModel.correctResponse[cat.id]).toBeDefined();
      scope.removeCategory(cat);
      expect(scope.fullModel.correctResponse[cat.id]).toBeUndefined();
    });
  });

  describe('addCategory', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      testModel.correctResponse = {};
      testModel.model.categories = [];
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
    });
    it('should not have a category in the beginning', function() {
      expect(scope.model.categories.length).toEqual(0);
    });
    it('should add a category', function() {
      scope.addCategory();
      expect(scope.model.categories.length).toEqual(1);
    });
    it('the new category should have default label Category 1', function() {
      scope.addCategory();
      expect(scope.model.categories[0].label).toEqual('Category 1');
    });
    it('a second new category should have label Category 2', function() {
      scope.addCategory();
      scope.addCategory();
      expect(scope.model.categories[1].label).toEqual('Category 2');
    });

  });

});