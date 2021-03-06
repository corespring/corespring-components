/* global describe, it, beforeEach, inject, module, expect */
describe('corespring:drag-and-drop-inline:configure', function() {

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
      "componentType": "corespring-drag-and-drop-inline",
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
      $provide.value('MathJaxService', {
        parseDomForMath: function() {}
      });
      $provide.value('WiggiMathJaxFeatureDef', function() {});
      $provide.value('WiggiLinkFeatureDef', function() {});
      $provide.value('Msgr', {send: function(){}} );
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
    element = $compile("<div navigator=''><corespring-drag-and-drop-inline-configure id='1'></corespring-drag-and-drop-inline-configure></div>")($rootScope.$new());
    scope = element.scope().$$childHead.$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toBeDefined();
  });

  it('component is being registered by the container', function() {
    expect(container.elements['1']).not.toBe(undefined);
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
      expect(testModel.correctResponse.aa_1).toContain("c_2");
      var c2RemoveSelector = '*[data-choice-id="c_2"] .delete-icon-button i';
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

  describe('removeAnswerArea', function() {
    it('should remove answerArea', function() {
      var ids, testModel = createTestModel({
        answerAreas: [{
          "id": "aa_1"
        }]
      });
      container.elements['1'].setModel(testModel);
      scope.removeAnswerArea('aa_1');
      expect(testModel.model.answerAreas).toEqual([]);
    });
    it('should remove correctResponses for this answerArea', function() {
      var ids, testModel = createTestModel({
        answerAreas: [{
          "id": "aa_1"
        }],
        correctResponse: {
          "aa_1" : ["c1"]
        }
      });
      container.elements['1'].setModel(testModel);
      scope.removeAnswerArea('aa_1');
      scope.$digest();
      expect(testModel.correctResponse).toEqual({});
    });
  });

  describe('removeSuperfluousAnswerAreaModels', function(){
    it('should remove a model if it does not have a component in xhtml', function(){
      var testModel = createTestModel({
        answerAreas: [{
          "id": "aa_1"
        }]
      });
      container.elements['1'].setModel(testModel);
      testModel.model.answerAreaXhtml = '';
      var resultModel = container.elements['1'].getModel();
      expect(resultModel.model.answerAreas.length).toBe(0);
    });
    it('should not remove a model if it does have a component in xhtml', function(){
      var testModel = createTestModel({
        answerAreas: [{
          "id": "aa_1"
        }]
      });
      container.elements['1'].setModel(testModel);
      testModel.model.answerAreaXhtml = '<answer-area-inline-csdndi id="aa_1"></answer-area-inline-csdndi>';
      var resultModel = container.elements['1'].getModel();
      expect(resultModel.model.answerAreas.length).toBe(1);
    });
  });

  describe('removeAllAfterPlacing', function(){
    var testModel;

    beforeEach(function(){
      testModel = createTestModel();
      container.elements['1'].setModel(testModel);
      scope.$digest();
    });

    function setRemoveAllAfterPlacing(value){
      //set the model like the checkbox would do
      testModel.model.config.removeAllAfterPlacing = value;

      //set one choice to have the opposite value so we can proove the action
      testModel.model.choices[0].moveOnDrag = !value;

      //call the onToggle like the checkbox would do
      scope.onToggleRemoveAllAfterPlacing();
      scope.$digest();
    }

    it('should set moveOnDrag=true for all choices when set to true', function(){
      setRemoveAllAfterPlacing(true);

      var resultModel = container.elements['1'].getModel();
      _.forEach(resultModel.model.choices, function(choice){
        expect(choice.moveOnDrag).toBe(true);
      });
    });

    it('should set moveOnDrag=false for all choices when set to false', function(){
      setRemoveAllAfterPlacing(false);

      var resultModel = container.elements['1'].getModel();
      _.forEach(resultModel.model.choices, function(choice){
        expect(choice.moveOnDrag).toBe(false);
      });
    });

    it('should be set to false, when one choice toggles moveOnDrag to false', function(){
      setRemoveAllAfterPlacing(true);
      var choice = testModel.model.choices[0];
      choice.moveOnDrag = false;
      scope.onToggleMoveOnDrag(choice);
      scope.$digest();

      expect(testModel.model.config.removeAllAfterPlacing).toBe(false);
    });

    it('should not change, when one choice toggles moveOnDrag to true', function(){
      setRemoveAllAfterPlacing(false);
      var choice = testModel.model.choices[0];
      choice.moveOnDrag = true;
      scope.onToggleMoveOnDrag(choice);
      scope.$digest();

      expect(testModel.model.config.removeAllAfterPlacing).toBe(false);
    });
  });

  describe('hasChoice', function(){
    var testModel;

    beforeEach(function(){
      testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });

    it("should return true, when choice is plain text", function(){
      scope.model.choices[0].label = "text";
      expect(scope.hasChoice(0)).toBe(true);
    });

    it("should return true, when choice is a number", function(){
      scope.model.choices[0].label = "123";
      expect(scope.hasChoice(0)).toBe(true);
    });

    it("should return true, when choice is xhtml with text", function(){
      scope.model.choices[0].label = "<div>test</div>";
      expect(scope.hasChoice(0)).toBe(true);
    });

    it("should return true, when choice is invalid html", function(){
      scope.model.choices[0].label = "<div>test";
      expect(scope.hasChoice(0)).toBe(true);
    });

    it("should return false, when choice is empty", function(){
      scope.model.choices[0].label = "";
      expect(scope.hasChoice(0)).toBe(false);
    });

    it("should return false, when choice is empty xhtml", function(){
      scope.model.choices[0].label = "<div></div>";
      expect(scope.hasChoice(0)).toBe(false);
    });

    it("should return false, when choice is empty invalid html", function(){
      scope.model.choices[0].label = "<div>";
      expect(scope.hasChoice(0)).toBe(false);
    });
  });

});