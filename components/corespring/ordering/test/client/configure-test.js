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

  function MockImageUtils() {
  }

  function MockWiggiMathJaxFeatureDef() {
  }

  beforeEach(function () {
    module(function ($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('ImageUtils', MockImageUtils);
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
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function () {
    expect(element).toNotBe(null);
  });

  it('component is being registered by the container', function () {
    expect(container.elements['1']).toNotBe(undefined);
    expect(container.elements['2']).toBeUndefined();
  });

  describe('partialScoring', function () {
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


});
