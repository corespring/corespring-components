/* global describe, it, beforeEach, inject, module, expect */
describe('corespring:dnd-categorize:configure', function() {

  "use strict";

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null,
    scope, container = null,
    rootScope, testModel;

  function createTestModel() {
    var categories = [
      {
        "id": "cat_1",
        "label": "Category 1"
      },
      {
        "id": "cat_2",
        "label": "Category 2"
      }
    ];
    var choices = [
      {
        "id": "choice_1",
        "label": "",
        "moveOnDrag": false
      },
      {
        "id": "choice_2",
        "label": "",
        "moveOnDrag": false
      },
      {
        "id": "choice_3",
        "label": "",
        "moveOnDrag": false
      },
      {
        "id": "choice_4",
        "label": "",
        "moveOnDrag": false
      }
    ];
    var correctResponse = {
      "cat_1": [],
      "cat_2": []
    };
    return {
      "componentType": "corespring-dnd-categorize",
      "title": "Drag and Drop Categorize",
      "weight": 1,
      "correctResponse": correctResponse,
      "feedback": {
        "correctFeedbackType": "default",
        "partialFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "allowPartialScoring": false,
      "partialScoring": [],
      "model": {
        "categories": categories,
        "choices": choices,
        "config": {
          "shuffle": false,
          "answerAreaPosition": "below",
          "categoriesPerRow": 2,
          "choicesPerRow": 2
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

  beforeEach(function() {
    module(function($provide) {
      $provide.value('MathJaxService', {
        parseDomForMath: function() {}
      });
      $provide.value('ServerLogic', MockServerLogic);
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerConfigPanel', function(ev, id, b) {
      container.registerConfigPanel(id, b);
    });

    $rootScope.registerConfigPanel = function(id, b) {
      container.registerConfigPanel(id, b);
    };
    element = $compile("<div navigator=''><corespring-dnd-categorize-configure id='1'></corespring-dnd-categorize-configure></div>")($rootScope.$new());
    scope = element.find('.config-corespring-dnd-categorize').isolateScope();
    rootScope = $rootScope;
  }));

  function setModel(){
    testModel = createTestModel();
    scope.containerBridge.setModel(testModel);
    rootScope.$digest();
  }

  it('constructs', function() {
    expect(element).toBeDefined();
    expect(element).not.toBe(null);
  });

  it('component is being registered by the container', function() {
    expect(container.elements['1']).toBeDefined();
    expect(container.elements['2']).toBeUndefined();
  });

  describe('setModel', function() {
    beforeEach(setModel);
    it('should set fullModel', function() {
      expect(scope.fullModel).toEqual(testModel);
    });
    it('should set model', function() {
      expect(scope.model).toEqual(testModel.model);
    });
    it('should set categories', function() {
      expect(scope.editorModel.categories.length).toBe(2);
    });
    it('should set choices', function() {
      expect(scope.editorModel.choices.length).toBe(4);
    });

  });

  describe('getModel', function() {
    beforeEach(setModel);
    it('should return fullModel', function() {
      expect(scope.containerBridge.getModel()).toEqual(scope.fullModel);
    });
  });

  describe('addCategory', function() {
    beforeEach(setModel);
    it('should add a category', function() {
      expect(scope.editorModel.categories.length).toBe(2);
      scope.addCategory();
      expect(scope.editorModel.categories.length).toBe(3);
    });
  });

  describe('addChoice', function() {
    beforeEach(setModel);
    it('should work', function() {
      expect(scope.editorModel.choices.length).toBe(4);
      scope.addChoice();
      expect(scope.editorModel.choices.length).toBe(5);
    });
  });

  describe('deactivate', function() {
    it('should call activate with an id that does not exist', function() {
      spyOn(scope, '$broadcast');
      scope.deactivate();
      expect(scope.$broadcast).toHaveBeenCalledWith('activate', 'none');
    });
  });


});