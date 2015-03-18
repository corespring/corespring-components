describe('drag-and-drop-categorize', function() {

  var element, scope, rootScope, container;

  beforeEach(angular.mock.module('test-app'));

  function model(options) {
    var correctResponse = (options && options.correctResponse) ? options.correctResponse : {
      "cat_1": [
        "choice_0"
      ]
    };
    return {
      "data": {
        "correctResponse" : correctResponse,
        "model" : {
          "categories" : [
            {
              "id" : "cat_1",
              "hasLabel" : true,
              "label" : "Category 1",
              "layout" : "vertical"
            }
          ],
          "choices" : [
            {
              "label" : "a",
              "labelType" : "text",
              "id" : "choice_0"
            },
            {
              "label" : "b",
              "labelType" : "text",
              "id" : "choice_1"
            },
            {
              "label" : "c",
              "labelType" : "text",
              "id" : "choice_2"
            },
            {
              "label" : "d",
              "labelType" : "text",
              "id" : "choice_3"
            }
          ],
          "config" : {
            "shuffle" : false
          }
        }
      }
    };
  }

  function MockComponentRegister() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  }

  beforeEach(module(function($provide) {
    $provide.value('DragAndDropTemplates', {
      choiceArea: function() {}
    });
    $provide.value('$modal', function() {});
  }));

  describe('see solution', function() {

    var testModel;

    beforeEach(function() {
      module(function($provide) {
        testModel = model();
      });
    });

    beforeEach(inject(function($compile, $rootScope) {
      container = new MockComponentRegister();

      $rootScope.$on('registerComponent', function(event, id, obj) {
        container.registerComponent(id, obj);
      });
      scope = $rootScope.$new();
      scope.local = {};
      element = $compile("<corespring-new-drag-and-drop-categorize-render id='1'></corespring-new-drag-and-drop-categorize-render>")(scope);
      scope = element.scope();
      rootScope = $rootScope;
      scope.$digest();
    }));

    describe('unsubmitted', function() {
      it('should be hidden', function() {
        expect($('.see-solution', element).hasClass('ng-hide')).toBe(true);
      });
    });

    function setResponse(response) {
      container.elements['1'].setResponse(response);
      rootScope.$digest();
    }

    describe('with correct response', function() {

      beforeEach(function() {
        setResponse({
          correctResponse: 'correct',
          feedback: 'Correct!',
          correctClass: 'correct'
        });
      });

      it('should be hidden', function() {
        expect($('.see-solution', element).hasClass('ng-hide')).toBe(true);
      });

    });

    describe('with incorrect response', function() {


      beforeEach(function() {
        setResponse({
          correctResponse: 'incorrect',
          feedback: 'Incorrect!',
          correctClass: 'incorrect'
        });
      });

      it('should be visible', function() {
        expect($('.see-solution', element).hasClass('ng-hide')).toBe(false);
      });

    });

  });

});