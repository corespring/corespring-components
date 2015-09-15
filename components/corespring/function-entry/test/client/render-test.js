describe('corespring:function-entry:render', function () {

  var MockComponentRegister = function () {
    this.elements = {};
    this.registerComponent = function (id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var MockMathJaxService = function () {
    this.parseDomForMath = function () {
    };
    this.onEndProcess = function () {
    };
  };

  var element, scope, rootScope, container, testModel, testModelTemplate;

  testModelTemplate = {
    data: {
      model: {
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
          "singleChoice": true
        }
      }
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function () {
    module(function ($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('MathJaxService', new MockMathJaxService());
      var mockPopover = function () {
        return {
          on: function () {
          }, popover: mockPopover
        };
      };
      $.fn.extend({popover: mockPopover});

    });
  });

  beforeEach(inject(function ($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function (event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-function-entry-render id='1'></corespring-function-entry-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function () {
    expect(element).not.toBe(null);
  });

  it('sets model', function () {
    container.elements['1'].setDataAndSession({
      data: {model: {}},
      session: {answers: {}}
    });
    expect(scope.question).not.toBe(null);
    expect(scope.session).not.toBe(null);
    expect(scope.answer).not.toBe(null);
  });

  describe('isAnswerEmpty', function () {
    it('should return true initially', function () {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function () {
      testModel.session = {
        answers: "4+5"
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function () {
      container.elements['1'].setDataAndSession(testModel);
      scope.answer = "4+5";
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge', function () {
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

  describe('answer change callback', function() {
    var changeHandlerCalled = false;

    beforeEach(function() {
      changeHandlerCalled = false;
      container.elements['1'].answerChangedHandler(function(c) {
        changeHandlerCalled = true;
      });
      container.elements['1'].setDataAndSession(testModel);
      scope.$digest();
      scope.graphCallback = null; //avoid accessing the canvas
    });

    it('does not get called initially', function() {
      expect(changeHandlerCalled).toBe(false);
    });

    it('does get called when a answer is selected', function() {
      scope.answer = "4+5";
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });

  });
});
