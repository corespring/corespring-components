/* global describe, beforeEach, module, inject, it, expect */

describe('corespring:drag-and-drop-inline', function() {

  "use strict";

  var testModel, container, element, scope, rootScope, wrapper, compile;

  function MockComponentRegister() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  }

  function createTestModel() {
    return {
      data: {
        "model": {
          "answerAreas": [
            {
              "id": "aa_1"
            }
          ],
          "answerAreaXhtml": "text before <answer-area-inline-csdndi id=\"aa_1\"></answer-area-inline-csdndi> text after",
          "choices": [
            {
              "label": "turkey",
              "labelType": "text",
              "id": "c_0",
              "moveOnDrag": true
            },
            {
              "label": "ham",
              "labelType": "text",
              "id": "c_1",
              "moveOnDrag": true
            },
            {
              "label": "lamb",
              "labelType": "text",
              "id": "c_2",
              "moveOnDrag": true
            },
            {
              "label": "bologna",
              "labelType": "text",
              "id": "c_3",
              "moveOnDrag": true
            }
          ],
          "config": {
            "shuffle": false,
            "choiceAreaLabel": "Choices",
            "choiceAreaLayout": "horizontal",
            "choiceAreaPosition": "below"
          }
        }
      }
    };
  }

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      var mockPopover = function(){ return {on: function(){}, popover: mockPopover }; };
      $.fn.extend({popover: mockPopover});

      testModel = createTestModel();

      $provide.value('MathJaxService', function() {});
      $provide.value('$modal', function() {});
      $provide.value('DragAndDropTemplates', {choiceArea:function(){}});
    });

  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-drag-and-drop-inline-render id='1'></corespring-drag-and-drop-inline-render>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
    compile = $compile;
  }));

  function setAnswer(answer){
    testModel.session = {
      answers: {'aa_1': _.isArray(answer) ? answer : [answer]}
    };
    container.elements['1'].setDataAndSession(testModel);
    rootScope.$digest();
  }

  function setResponse(response){
    container.elements['1'].setResponse(response);
    rootScope.$digest();
  }

  function wrapElement(){
    var wrapper = $("<div/>");
    wrapper.append($(element));
    return wrapper;
  }

  describe('render', function() {

    it('sets the session choice correctly', function() {
      setAnswer('c_1');

      expect(_.pick(scope.landingPlaceChoices.aa_1[0], 'label', 'id')).toEqual({
        label: 'ham',
        id: 'c_1'
      });
    });
    
    it('shows the text in the answerArea', function(){
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      wrapper = wrapElement();
      var $answerArea = wrapper.find(".answer-area-holder");
      expect($answerArea.length).toBe(1);

      var text = $answerArea.text();
      expect(text).toContain('text before');
      expect(text).toContain('text after');
    });

    it('removes selected choices from available choices', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(_.find(scope.local.choices, {'id':'c_1'})).toBeDefined();
      setAnswer('c_1');
      expect(_.find(scope.local.choices, {'id':'c_1'})).toBeUndefined();
    });

    it('setting response shows correctness', function() {
      setAnswer('c_1');
      setResponse({correctness: 'incorrect', correctClass: "incorrectClass", feedback:{}});
      wrapper = wrapElement();
      expect(wrapper.find(".incorrectClass").length > 0).toBe(true);
    });

    describe("see-solution button",function(){

      function setCorrectness(correctness){
        setAnswer('c_1');
        setResponse({correctness: correctness, correctResponse: {}});
        wrapper = wrapElement();
      }

      it('should populate correctResponse when answer is incorrect', function() {
        setCorrectness('incorrect');

        expect(scope.correctResponse).toBeTruthy();
      });

      it('should not populate correctResponse if answer is correct', function() {
        setCorrectness('correct');

        expect(scope.correctResponse).toBeFalsy();
      });

      it('should show the button when answer is incorrect', function() {
        setCorrectness('incorrect');

        expect($(wrapper.find(".see-solution")).attr('class')).not.toContain('ng-hide');
      });

      it('should hide the button if answer is correct', function() {
        setCorrectness('correct');

        expect($(wrapper.find(".see-solution")).attr('class')).toContain('ng-hide');
      });

    });

    describe("dragAndDropScopeId", function(){
      it("should be initialised with a different value every time it is linked", function(){
        var link = compile("<corespring-drag-and-drop-inline-render id='1'></corespring-drag-and-drop-inline-render>");
        element = link(rootScope.$new());
        scope = element.scope();
        var idOne = scope.dragAndDropScopeId;
        element = link(rootScope.$new());
        scope = element.scope();
        var idTwo = scope.dragAndDropScopeId;
        expect(idOne).not.toEqual(idTwo);
      });
    });

    describe("cleanChoiceForId", function(){
      it("should remove $$hashKey", function(){
        var item = {id:"c1", $$hashKey: "h1"};
        scope.originalChoices = [item];
        var resultItem = scope.cleanChoiceForId("c1");
        expect(resultItem).toEqual({id:'c1'});
      });
      it("should return a clone", function(){
        var item = {id:"c1"};
        scope.originalChoices = [item];
        var resultItem = scope.cleanChoiceForId("c1");
        expect(resultItem).toEqual({id:'c1'});
        expect(resultItem).not.toBe(item);
      });
    });

    describe("classForChoice", function(){
      it("should return the feedback per choice", function(){
        scope.response = {feedbackPerChoice: {'aa_1':['correct', 'incorrect']}};
        expect(scope.classForChoice('aa_1', 0)).toEqual('correct');
        expect(scope.classForChoice('aa_1', 1)).toEqual('incorrect');
      });
      it("should return incorrect if server did not return feedbackPerChoice", function(){
        scope.response = {};
        expect(scope.classForChoice('aa_1', 0)).toEqual('incorrect');
        expect(scope.classForChoice('aa_1', 1)).toEqual('incorrect');
      });
      it("should return incorrect if server did not return feedback for all choices", function(){
        scope.response = {feedbackPerChoice: {'aa_1':['correct']}};
        expect(scope.classForChoice('aa_1', 0)).toEqual('correct');
        expect(scope.classForChoice('aa_1', 1)).toEqual('incorrect');
      });
      it("should return editable as long as server did not return response", function(){
        scope.editable = true;
        expect(scope.classForChoice('aa_1', 0)).toEqual('editable');
        expect(scope.classForChoice('aa_1', 1)).toEqual('editable');
      });
      it("should return undefined as long as setDataAndSession has not been called", function(){
        expect(scope.classForChoice('aa_1', 0)).toBeUndefined();
        expect(scope.classForChoice('aa_1', 1)).toBeUndefined();
      });
    });

    describe("draggableJqueryOptions", function(){
      it("should set the scope to the dragAndDropScopeId", function(){
        var result = scope.draggableJqueryOptions();
        expect(result.scope).toEqual(scope.dragAndDropScopeId);
      });
      it("should set revert to invalid", function(){
        var result = scope.draggableJqueryOptions();
        expect(result.revert).toEqual('invalid');
      });
    });

    describe("answerChangeCallback", function(){

      it("should remove placed items from the available choices, if moveOnDrag is true", function(){
        scope.originalChoices = [{id:"c1"}, {id:"c2", moveOnDrag: true}];
        scope.local = {choices: [{id:"c1"}, {id:"c2", moveOnDrag: true}]};
        scope.landingPlaceChoices= {'aa_1': [{id:'c2'}]};
        scope.answerChangeCallback();
        expect(scope.local.choices).toEqual([{id:"c1"}]);
      });

      it("should add removed items to the available choices, if they are not placed", function(){
        scope.originalChoices = [{id:"c1"}, {id:"c2", moveOnDrag: true}];
        scope.local = {choices: [{id:"c1"}]};
        scope.landingPlaceChoices= {'aa_1': []};
        scope.answerChangeCallback();
        expect(scope.local.choices).toEqual([{id:"c1"},{id:"c2", moveOnDrag: true}]);
      });

      it("should retain the $$hashKey", function(){
        scope.originalChoices = [{id:"c1"}, {id:"c2", moveOnDrag: true}];
        scope.local = {choices: [{id:"c1", $$hashKey: 'h1'}, {id:"c2", moveOnDrag: true, $$hashKey: 'h2'}]};
        scope.landingPlaceChoices= {'aa_1': [{id:'c2'}]};
        scope.answerChangeCallback();
        expect(scope.local.choices).toEqual([{id:"c1", $$hashKey: 'h1'}]);
      });
    });

    describe("canEdit", function(){
      it("should return false before setDataAndSession",function(){
        expect(scope.canEdit()).toBeFalsy();
      });

      it("should return true after setDataAndSession",function(){
        scope.containerBridge.setDataAndSession({data:{model:{config:{}}}});
        expect(scope.canEdit()).toBeTruthy();
      });

      it("should return false after setResponse",function(){
        scope.containerBridge.setDataAndSession({data:{model:{config:{}}}});
        scope.containerBridge.setResponse({});
        expect(scope.canEdit()).toBeFalsy();
      });
    });

    describe("cleanLabel", function(){
      it("should remove zero-width-space (8203) character", function(){
        var label =  String.fromCharCode(8203) + "A" + String.fromCharCode(8203) + "B" + String.fromCharCode(8203);
        expect(scope.cleanLabel({label:label})).toEqual('AB');
      });
    });

  });

});
