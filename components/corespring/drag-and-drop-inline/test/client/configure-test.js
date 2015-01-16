/* global describe, it, beforeEach, inject, module, expect */
describe('corespring:drag-and-drop-inline:configure', function () {

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
      "componentType": "corespring-drag-and-drop-inline",
      "correctResponse": {
        "aa_1": [
          "choice_0","choice_1","choice_2"
        ]
      },
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
        "answerAreas": [
          {
            "id": "aa_1",
            "textBefore": "Americans eat",
            "textAfter": "for Thanksgiving dinner."
          }
        ],
        "choices": [
          {
            "label": "turkey",
            "labelType": "text",
            "id": "choice_0"
          },
          {
            "label": "ham",
            "labelType": "text",
            "id": "choice_1"
          },
          {
            "label": "lamb",
            "labelType": "text",
            "id": "choice_2"
          },
          {
            "label": "bologna",
            "labelType": "text",
            "id": "choice_3"
          }
        ],
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
    load: function () {
      return {defaults: {}, keys: {}};
    }
  };

  beforeEach(function () {
    module(function ($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('ImageUtils', {});
      $provide.value('MathJaxService', {
        parseDomForMath: function () {
        }
      });
      $provide.value('WiggiMathJaxFeatureDef', function(){});
      $provide.value('WiggiLinkFeatureDef', function(){});
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
    element = $compile("<div navigator=''><corespring-drag-and-drop-inline-configure id='1'></corespring-drag-and-drop-inline-configure></div>")(scope);
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function () {
    expect(element).toBeDefined();
  });

  it('component is being registered by the container', function () {
    expect(container.elements['1']).toNotBe(undefined);
    expect(container.elements['2']).toBeUndefined();
  });

  describe('partialScoring', function () {
    it('should automatically remove additional partial scoring scenarios after removing a correct choice', function () {
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

});
