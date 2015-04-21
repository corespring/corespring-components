describe('corespring:blueprint:configure', function() {

  "use strict";

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null,
    container = null,
    scope, rootScope;

  function createTestModel() {
    return {
      componentType: "corespring-blueprint",
      title: "sample item",
      weight: 4,
      correctResponse: {
        //TODO fill in correct response
      },
      allowPartialScoring: true,
      partialScoring: [
        {
          numberOfCorrect: 1,
          scorePercentage: 10
        },
        {
          numberOfCorrect: 2,
          scorePercentage: 20
        },
        {
          numberOfCorrect: 3,
          scorePercentage: 30
        },
        {
          numberOfCorrect: 4,
          scorePercentage: 40
        }
      ],
      feedback: {
        correctFeedbackType: "default",
        partialFeedbackType: "default",
        incorrectFeedbackType: "custom",
        incorrectFeedback: " <span mathjax=\"\">\\(\\frac12\\)</span> Everything is wrong !"
      },
      model: {
        //TODO fill in rendering model
        config: {
          //TODO fill in rendering config
        }
      }
    };
  }

  beforeEach(angular.mock.module('test-app'));

  function fakeEvent() {
    return {
      stopPropagation: function() {},
      preventDefault: function() {}
    };
  }

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
      // TODO provide values for the things that config wants to be injected
      $provide.value('InjectedObject', {})
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
    element = $compile("<div navigator=''><corespring-blueprint-configure id='1'></corespring-blueprint-configure></div>")(scope);
    scope = element.scope().$$childHead.$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });

  it('component is being registered by the container', function() {
    expect(container.elements['1']).toBeDefined();
    expect(container.elements['2']).toBeUndefined();
  });

});