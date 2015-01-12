/* global describe, beforeEach, module, inject, it, expect */

describe('corespring:drag-and-drop-inline', function() {

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
              "id": "aa_1",
              "textBefore": "Americans eat",
              "textAfter": "for Thanksgiving dinner."
            }
          ],
          "choices": [
            {
              "label": "turkey",
              "labelType": "text",
              "id": "choice_0"
            },
            {
              "label": "ham",
              "labelType": "text",
              "id": "choice_1"
            },
            {
              "label": "lamb",
              "labelType": "text",
              "id": "choice_2"
            },
            {
              "label": "bologna",
              "labelType": "text",
              "id": "choice_3"
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
  }));

  function setAnswer(answer){
    testModel.session = {
      answers: [[answer]]
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

      setAnswer('choice_1');

      expect(_.pick(scope.landingPlaceChoices[0][0], 'label', 'id')).toEqual({
        label: 'ham',
        id: 'choice_1'
      });
    });

    it('removes selected choices from available choices', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(_.find(scope.local.choices, {'id':'choice_1'})).toBeDefined();
      setAnswer('choice_1');
      expect(_.find(scope.local.choices, {'id':'choice_1'})).not.toBeDefined();
    });

    it('setting response shows correctness', function() {
      setAnswer('choice_1');
      setResponse({correctClass: "incorrect", feedback:{}});
      wrapper = wrapElement();
      expect(wrapper.find(".incorrect").length).toBe(1);
    });

    describe("see-solution button",function(){

      function setCorrectResponse(correctResponse){
        setAnswer('choice_1');
        setResponse({"correctResponse": correctResponse});
        wrapper = wrapElement();
      }

      it('should show the button when answer is incorrect', function() {
        setCorrectResponse(null);

        expect(wrapper.find("a[ngClick='_seeSolution()']").length).toBe(0);
      });

      it('should hide the button if answer is correct', function() {
        setCorrectResponse({});

        expect(wrapper.find("a[ng-click='_seeSolution()']").length).toBe(1);
      });

    });



  });

});
