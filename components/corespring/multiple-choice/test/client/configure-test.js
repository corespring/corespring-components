/*global describe,inject,beforeEach,it,expect,module*/
describe('corespring:multiple-choice:configure', function() {

  "use strict";

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null, scope, container = null, rootScope;

  function createTestModel() {
    return {
      "componentType": "corespring-multiple-choice",
      "correctResponse": {
        "value": [
          "1","2","3"
        ]
      },
      "feedback": [
        {
          "feedback": "Huh?",
          "feedbackType": "custom",
          "value": "1"
        },
        {
          "feedback": "4 to the floor",
          "feedbackType": "custom",
          "value": "2"
        },
        {
          "feedbackType": "default",
          "value": "3"
        }
      ],
      "scoreMapping": {
        "1": 0,
        "2": 1,
        "3": -1
      },
      "model": {
        "choices": [
          {
            "label": "1",
            "value": "1"
          },
          {
            "label": "2",
            "value": "2"
          },
          {
            "label": "3",
            "value": "3"
          }
        ],
        "config": {
          "orientation": "vertical",
          "shuffle": true,
          "singleChoice": false
        }
      }
    };
  }

  beforeEach(angular.mock.module('test-app'));

  var MockServerLogic = {
    load: function() {
      return {defaults: {}, keys: {}};
    }
  };
  function MockImageUtils() {}
  function MockWiggiMathJaxFeatureDef() {}

  beforeEach(function() {
    module(function($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('ImageUtils', MockImageUtils);
      $provide.value('WiggiMathJaxFeatureDef', MockWiggiMathJaxFeatureDef);
      $provide.value('WiggiLinkFeatureDef', function(){});
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
    element = $compile("<div navigator=''><corespring-multiple-choice-configure id='1'></corespring-multiple-choice-configure></div>")(scope);
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });

  it('component is being registered by the container', function() {
    expect(container.elements['1']).toNotBe(undefined);
    expect(container.elements['2']).toBeUndefined();
  });

  it('component serializes model backwards', function() {
    container.elements['1'].setModel(createTestModel());
    var model = container.elements['1'].getModel();
    expect(model).not.toBe(null);
    expect(model.scoreMapping).not.toBe(null);
    expect(model.scoreMapping).toEqual({
      '1': 0,
      '2': 1,
      '3': -1
    });
    expect(model.feedback).not.toBe(null);
    expect(model.model).not.toBe(null);
  });

  describe('partialScoring', function(){
    it('should automatically remove additional partial scoring scenarios after removing a correct choice', function(){
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
