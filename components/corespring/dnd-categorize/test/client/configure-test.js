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
          "categoriesPerRow": 1,
          "choicesPerRow": 1
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
      $provide.value('Msgr', {send:function(){}});
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

  function setModel() {
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
    it('should set partialScoring', function() {
      expect(scope.editorModel.partialScoring.sections.length).toBe(2);
    });
  });

  describe('partialScoring', function() {
    function ignoreNgHash(sections) {
      var result = _.cloneDeep(sections);
      _.forEach(result, function(section) {
        delete section.$$hashKey;
        _.forEach(section.partialScoring, function(scenario) {
          delete scenario.$$hashKey;
        });
      });
      return result;
    }
    function sections(index){
      var s = ignoreNgHash(scope.editorModel.partialScoring.sections);
      return isNaN(index) ? s : s[index];
    }
    it('setModel should create sections if they do not exist', function() {
      setModel();
      expect(sections()).toEqual(
        [{
          catId: 'cat_1',
          label: 'Category 1',
          numberOfCorrectResponses: 0,
          partialScoring: [{
            numberOfCorrect: 1,
            scorePercentage: 0
          }],
          maxNumberOfScoringScenarios: 1,
          canAddScoringScenario: false,
          canRemoveScoringScenario: false
        }, {
          catId: 'cat_2',
          label: 'Category 2',
          numberOfCorrectResponses: 0,
          partialScoring: [{
            numberOfCorrect: 1,
            scorePercentage: 0
          }],
          maxNumberOfScoringScenarios: 1,
          canAddScoringScenario: false,
          canRemoveScoringScenario: false
        }]
      );
    });
    it('should keep existing sections and augment them', function() {
      var dummy = createTestModel();
      var testModel = {
        model: {
          choices: dummy.model.choices,
          categories: _.take(dummy.model.categories, 1),
          config: {}
        },
        correctResponse: {
          cat_1: ['choice_1', 'choice_2']
        },
        partialScoring: {
          sections: [
            {
              catId: 'cat_1',
              partialScoring: [{
                numberOfCorrect: 1,
                scorePercentage: 44
              }]
            }
          ]
        }
      };
      scope.containerBridge.setModel(testModel);
      rootScope.$digest();
      var section = sections(0);
      expect(section.catId).toEqual('cat_1');
      expect(section.label).toEqual('Category 1');
      expect(section.numberOfCorrectResponses).toEqual(2);
      expect(section.maxNumberOfScoringScenarios).toEqual(1);
      expect(section.canAddScoringScenario).toEqual(false);
      expect(section.canRemoveScoringScenario).toEqual(false);
      expect(section.partialScoring).toEqual([{
        numberOfCorrect: 1,
        scorePercentage: 44
      }]);
    });

    it('should set canAddScenario to true, when number of scenarios < max', function() {
      var dummy = createTestModel();
      var testModel = {
        model: {
          choices: dummy.model.choices,
          categories: _.take(dummy.model.categories, 1),
          config: {}
        },
        correctResponse: {
          cat_1: ['choice_1', 'choice_2', 'choice_3']
        },
        partialScoring: {
          sections: [
            {
              catId: 'cat_1',
              partialScoring: [{
                numberOfCorrect: 1,
                scorePercentage: 44
              }]
            }
          ]
        }
      };
      scope.containerBridge.setModel(testModel);
      rootScope.$digest();
      var section = sections(0);
      expect(section.catId).toEqual('cat_1');
      expect(section.label).toEqual('Category 1');
      expect(section.numberOfCorrectResponses).toEqual(3);
      expect(section.maxNumberOfScoringScenarios).toEqual(2);
      expect(section.canAddScoringScenario).toEqual(true);
      expect(section.canRemoveScoringScenario).toEqual(false);
      expect(section.partialScoring).toEqual([{
        numberOfCorrect: 1,
        scorePercentage: 44
      }]);
    });

    it('should set canRemoveScenario to true, when number of scenarios > 1', function() {
      var dummy = createTestModel();
      var testModel = {
        model: {
          choices: dummy.model.choices,
          categories: _.take(dummy.model.categories, 1),
          config: {}
        },
        correctResponse: {
          cat_1: ['choice_1', 'choice_2', 'choice_3']
        },
        partialScoring: {
          sections: [
            {
              catId: 'cat_1',
              partialScoring: [{
                  numberOfCorrect: 1,
                  scorePercentage: 11
              },
                {
                  numberOfCorrect: 2,
                  scorePercentage: 22
              }]
            }
          ]
        }
      };
      scope.containerBridge.setModel(testModel);
      rootScope.$digest();
      var section = sections(0);
      expect(section.catId).toEqual('cat_1');
      expect(section.label).toEqual('Category 1');
      expect(section.numberOfCorrectResponses).toEqual(3);
      expect(section.maxNumberOfScoringScenarios).toEqual(2);
      expect(section.canAddScoringScenario).toEqual(false);
      expect(section.canRemoveScoringScenario).toEqual(true);
      expect(section.partialScoring).toEqual([{
          numberOfCorrect: 1,
          scorePercentage: 11
      },
        {
          numberOfCorrect: 2,
          scorePercentage: 22
        }]);
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
    it('should set moveOnDrag to true if removeAllAfterPlacing is true', function(){
      scope.editorModel.removeAllAfterPlacing.value = true;
      scope.addChoice();
      expect(scope.editorModel.choices.pop().moveOnDrag).toBe(true);
    });
    it('should set moveOnDrag to false if removeAllAfterPlacing is false', function(){
      scope.editorModel.removeAllAfterPlacing.value = false;
      scope.addChoice();
      expect(scope.editorModel.choices.pop().moveOnDrag).toBe(false);
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