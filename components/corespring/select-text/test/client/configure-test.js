/*global describe,inject,beforeEach,it,expect,module*/
describe('corespring:select-text:configure', function () {

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
      "componentType" : "corespring-select-text",
      "correctResponse" : "",
      "title": "Select Evidence in Text",
      "feedback" : {
        "correctFeedbackType" : "default",
        "partialFeedbackType" : "default",
        "incorrectFeedbackType" : "default",
        "feedbackType" : "default"
      },
      "allowPartialScoring": false,
      "partialScoring" : [
        {"numberOfCorrect": 1, "scorePercentage": 25}
      ],
      "model": {
        "config" : {
          "selectionUnit" : "word",
          "checkIfCorrect" : true,
          "showFeedback": true
        },
        "choices" : [
          {
            "data": "Please",
            "correct": true
          },
          {
            "data": "enter",
            "correct": true
          },
          {
            "data": "some",
            "correct": true
          },
          {
            "data": "text."
          }
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


  function MockWiggiMathJaxFeatureDef() {
  }


  beforeEach(function () {
    module(function ($provide) {
      $provide.value('ServerLogic', MockServerLogic);
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
    element = $compile("<div navigator=''><corespring-select-text-configure id='1'></corespring-select-text-configure></div>")(scope);
    element = element.find('.corespring-select-text-config');
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  function setModelAndDigest(){
    container.elements['1'].setModel(createTestModel());
    scope.$digest();
  }

  it('constructs', function () {
    expect(element).not.toBe(null);
  });

  it('component is being registered by the container', function () {
    expect(container.elements['1']).not.toBe(undefined);
    expect(container.elements['2']).toBeUndefined();
  });

  it('should update the passage when the plainText is changed', function(){
    setModelAndDigest();
    scope.model.passage = '';
    scope.model.cleanPassage = 'line1\nline2\nline3';
    scope.$digest();
    expect(scope.model.passage).toEqual('line1<br>line2<br>line3');
  });

  describe('partialScoring', function () {
    function removeChoice(){
      scope.content.xhtml = scope.model.choices.slice(1).join(' ');
    }

    xit('should automatically remove additional partial scoring scenarios after removing a correct choice', function () {
      var testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      rootScope.$digest();
      expect(scope.numberOfCorrectResponses).toEqual(3);
      expect(scope.maxNumberOfScoringScenarios).toEqual(2);
      scope.addScoringScenario();
      expect(scope.fullModel.partialScoring.length).toEqual(2);
      removeChoice();
      rootScope.$digest();
      expect(scope.fullModel.partialScoring.length).toEqual(1);
    });
  });


});
