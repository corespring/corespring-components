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
      "componentType": "corespring-dnd-categorize",
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
    element = $compile("<div navigator=''><corespring-dnd-categorize-configure id='1'></corespring-dnd-categorize-configure></div>")($rootScope.$new());
    scope = element.find('.config-corespring-dnd-categorize').isolateScope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toBeDefined();
    expect(element).not.toBe(null);
  });

  it('component is being registered by the container', function() {
    expect(container.elements['1']).toBeDefined();
    expect(container.elements['2']).toBeUndefined();
  });



});