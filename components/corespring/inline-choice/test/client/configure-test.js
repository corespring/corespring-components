/*global describe,inject,beforeEach,it,expect,module*/
describe('corespring:inline-choice:configure', function() {

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
      "componentType" : "corespring-inline-choice",
      "title": "Less Fruits",
      "weight" : 1,
      "correctResponse" : ["mc_2", "mc_4"],
      "feedback" : [
        { "value" : "mc_1", "feedback" : "Looking bad buddy", "feedbackType": "custom"},
        { "value" : "mc_2", "feedback" : "Looking good buddy", "feedbackType": "custom"},
        { "value" : "mc_3", "feedback" : "Looking bad buddy", "feedbackType": "custom"},
        { "value" : "mc_4", "feedback" : "Looking good buddy", "feedbackType": "default"}
      ],
      "model" : {
        "config": {
          "shuffle": true
        },
        "choices": [
          {"label": "Banana", "value": "mc_1"},
          {"label": "Carrot", "value": "mc_2"},
          {"label": "Apple", "value": "mc_3"},
          {"label": "Lemon", "value": "mc_4"}
        ]
      }
    };
  }

  beforeEach(angular.mock.module('test-app'));

  var MockServerLogic = {
    load: function() {
      return {
        defaults: {},
        keys: {},
        ensureCorrectResponseIsArray: function() {

        }
      };
    }
  };

  function MockImageUtils() {}

  function MockWiggiMathJaxFeatureDef() {}

  beforeEach(function() {
    module(function($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('ImageUtils', MockImageUtils);
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
    element = $compile("<div navigator=''><corespring-inline-choice-configure id='1'></corespring-inline-choice-configure></div>")(scope);
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

  describe('addChoice', function() {
    beforeEach(function() {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });

    it('should have three choices initially', function() {
      expect(scope.model.choices.length).toEqual(4);
    });

    it('should have four choices after addChoice', function() {
      scope.addChoice();
      expect(scope.model.choices.length).toEqual(5);
    });

    it('the new choice should have feedback=default', function() {
      scope.addChoice();
      var uid = scope.model.choices[3].value;
      var fb = scope.feedback[uid];
      expect(fb.feedbackType).toEqual('default');
    });

    it('the new feedback should also be in the fullModel', function() {
      scope.addChoice();
      var uid = scope.model.choices[3].value;
      var fb = _.find(scope.fullModel.feedback, function(fb){
        return fb.value === uid;
      });
      expect(fb).toBeDefined();
      expect(fb.feedbackType).toEqual('default');
    });

  });




});