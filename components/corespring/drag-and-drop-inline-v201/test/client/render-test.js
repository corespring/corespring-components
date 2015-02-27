/* global describe, beforeEach, module, inject, it, expect */

describe('corespring:drag-and-drop-inline-v201', function() {

  "use strict";

  var testModel, container, element, scope, rootScope, wrapper;

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
          "answerAreaXhtml": "text before <answer-area-inline-csdndi-v201 id=\"aa_1\"></answer-area-inline-csdndi-v201> text after",
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

    element = $compile("<corespring-drag-and-drop-inline-v201-render id='1'></corespring-drag-and-drop-inline-v201-render>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
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
      expect(_.find(scope.local.choices, {'id':'c_1'})).not.toBeDefined();
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



  });

});
