/* global describe, it, beforeEach, inject, module, expect */
describe('corespring:drag-and-drop-inline-v201:configure', function() {

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

  function createTestModel(options) {
    var answerAreas = (options && options.answerAreas) || [
      {
        "id": "aa_1"
      }
    ];
    var choices = (options && options.choices) || [
      {
        "label": "turkey",
        "labelType": "text",
        "id": "c_0"
      },
      {
        "label": "ham",
        "labelType": "text",
        "id": "c_1"
      },
      {
        "label": "lamb",
        "labelType": "text",
        "id": "c_2"
      },
      {
        "label": "bologna",
        "labelType": "text",
        "id": "c_3"
      }
    ];

    var correctResponse = (options && options.correctResponse) || {
      "aa_1": [
        "c_0", "c_1", "c_2"
      ]
    };

    return {
      "componentType": "corespring-drag-and-drop-inline-v201",
      "correctResponse": correctResponse,
      "feedback": {
        "correctFeedbackType": "default",
        "partialFeedbackType": "default",
        "incorrectFeedbackType": "default"
      },
      "allowPartialScoring": false,
      "partialScoring": [
        {
          "numberOfCorrect": 1,
          "scorePercentage": 25
        }
      ],
      "model": {
        "answerAreas": answerAreas,
        "choices": choices,
        "config": {
          "shuffle": false,
          "choiceAreaLabel": "Choices",
          "choiceAreaLayout": "horizontal",
          "choiceAreaPosition": "below"
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
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('ImageUtils', {});
      $provide.value('MathJaxService', {
        parseDomForMath: function() {}
      });
      $provide.value('WiggiMathJaxFeatureDef', function() {});
      $provide.value('WiggiLinkFeatureDef', function() {});
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
    element = $compile("<div navigator=''><corespring-drag-and-drop-inline-v201-configure id='1'></corespring-drag-and-drop-inline-v201-configure></div>")($rootScope.$new());
    scope = element.scope().$$childHead.$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toBeDefined();
  });

  it('component is being registered by the container', function() {
    expect(container.elements['1']).toNotBe(undefined);
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
      scope.removeChoice(scope.model.choices[0].id);
      rootScope.$digest();
      expect(scope.fullModel.partialScoring.length).toEqual(1);
    });
  });

  describe('add choice button', function() {
    it('should add a choice to the model', function() {
      var testModel = createTestModel();
      var initialLength = testModel.model.choices.length;
      container.elements['1'].setModel(testModel);
      expect($('.add-choice', element).length).not.toBe(0);
      $('.add-choice', element).click();
      scope.$digest();
      expect(testModel.model.choices.length).toBe(initialLength + 1);
    });
  });

  describe('remove choice button', function() {
    it('should be visible with more than one choice', function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      scope.$digest();
      $('.remove-choice', element).each(function(i, el) {
        expect($(el).hasClass('ng-hide')).toBe(false);
      });
    });

    it('should be hidden with one choice', function() {
      var testModel = createTestModel({
        choices: [
          {
            "label": "turkey",
            "labelType": "text",
            "id": "c_0"
          }
        ],
        correctResponse: {
          "aa_1": [
            "c_0"
          ]
        }
      });
      container.elements['1'].setModel(testModel);
      scope.$digest();
      $('.remove-choice', element).each(function(i, el) {
        expect($(el).hasClass('ng-hide')).toBe(true);
      });
    });

    it('should remove choice c_2 from the model', function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      scope.$digest();
      var c2RemoveSelector = '*[data-choice-id="c_2"] .delete-icon-button i';
      expect(testModel.correctResponse.aa_1).toContain("c_2");
      $(c2RemoveSelector, element).click();
      scope.$digest();
      expect(testModel.correctResponse.aa_1).not.toContain("c_2");
    });

  });

  describe('addAnswerArea', function() {
    it('should add unique answer area ids', function() {
      var ids, testModel = createTestModel({
        answerAreas: [{
          "id": "aa_1"
        }]
      });
      container.elements['1'].setModel(testModel);
      scope.addAnswerArea();
      scope.addAnswerArea();
      ids = _.pluck(testModel.model.answerAreas, "id");
      expect(ids).toEqual(_.uniq(ids));
    });
  });

});