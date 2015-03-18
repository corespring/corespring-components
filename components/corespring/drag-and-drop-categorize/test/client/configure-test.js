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
      "partialScoring": {
        "cat_1" :[{
          "numberOfCorrect": 1,
          "scorePercentage": 25
        },{
          "numberOfCorrect": 1,
          "scorePercentage": 25
        },{
          "numberOfCorrect": 1,
          "scorePercentage": 25
        }
        ]
      },
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

  function MockImageUtils() {}

  function MockWiggiMathJaxFeatureDef() {}

  beforeEach(function() {
    module(function($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('ImageUtils', MockImageUtils);
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
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  function eq(objToDelete){
    return function (obj){
      return objToDelete === obj;
    }
  }

  function byId(id){
    return function(object){
      return object.id === id;
    };
  }

  function byModelId(id){
    return function(object){
      return object.model.id === id;
    };
  }

  it('constructs', function() {
    expect(element).toBeDefined();
  });


  it('component is being registered by the container', function() {
    expect(container.elements['1']).toNotBe(undefined);
    expect(container.elements['2']).toBeUndefined();
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
      _.remove(scope.categories,byModelId("cat_1"));
      rootScope.$digest();
      var model = container.elements['1'].getModel();
      expect(model.model.categories.length).toBe(0);
    });

    it('should remove the category from the correctResponse', function() {
      var cat = scope.model.categories[0];
      expect(scope.fullModel.correctResponse[cat.id]).toBeDefined();
      _.remove(scope.categories,byModelId("cat_1"));
      rootScope.$digest();
      var model = container.elements['1'].getModel();
      expect(model.correctResponse[cat.id]).toBeUndefined();
    });
  });

  describe('addCategory', function() {

    beforeEach(function() {
      var testModel = createTestModel();
      testModel.partialScoring = {};
      testModel.correctResponse = {};
      testModel.model.categories = [];
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
    });

    it('should add a category', function() {
      expect(scope.fullModel.model.categories.length).toEqual(0);

      scope.addCategory();

      rootScope.$digest();

      var model = container.elements['1'].getModel();

      expect(model.model.categories.length).toEqual(1);

    });

    it('the new category should have default label Category 1', function() {

      scope.addCategory();
      rootScope.$digest();
      var model = container.elements['1'].getModel();
      expect(model.model.categories[0].label).toEqual('Category 1');
    });

    it('a second new category should have label Category 2', function() {
      scope.addCategory();
      scope.addCategory();
      rootScope.$digest();
      var model = container.elements['1'].getModel();
      expect(model.model.categories[1].label).toEqual('Category 2');
    });

  });

});