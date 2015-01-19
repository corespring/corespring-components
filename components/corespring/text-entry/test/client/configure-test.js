/*global describe,inject,beforeEach,it,expect,module*/
describe('corespring:text-entry:configure', function () {

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
      "componentType": "corespring-text-entry",
      "correctResponses": {
        "award": 100,
        "values": [
          "one",
          "1,500,000.00",
          "three/quarter"
        ],
        "ignoreWhitespace": false,
        "ignoreCase": false,
        "feedback": {
          "type": "default",
          "value": "Correct!"
        },
        "caseSensitive": true
      },
      "incorrectResponses": {
        "award": 0,
        "feedback": {
          "type": "default",
          "value": "Good try, but the correct answer is <random selection from correct answers>."
        }
      },
      "model": {
        "answerBlankSize": 8,
        "answerAlignment": "left"
      },
      "partialResponses": {
        "values": [],
        "award": 25,
        "ignoreCase": false,
        "ignoreWhitespace": false,
        "feedback": {
          "type": "default",
          "custom": "",
          "value": "Very good, but an even better answer would have been <random selection from correct answers>."
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
    element = $compile("<div navigator=''><corespring-text-entry-configure id='1'></corespring-text-entry-configure></div>")(scope);
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

  describe('answersInput', function(){
    it('should have responseInputs', function(){
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
      expect($(element).find(".response-input").length).toBe(2);
    });
    it('the model should have correctResponses', function(){
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
      expect(scope.fullModel.correctResponses.values.length).toBe(3);
    });
    it('should have all three choice items for correct responses', function(){
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
      var $items = $(element).find(".ui-select-match-item");
      expect($items.length).toBe(3);
      expect($items.find("span.ng-binding:contains('one')").length).toBe(1);
      expect($items.find("span.ng-binding:contains('1,500,000.00')").length).toBe(1);
      expect($items.find("span.ng-binding:contains('three/quarter')").length).toBe(1);
    });
  });

});
