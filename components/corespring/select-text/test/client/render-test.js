describe('corespring:select-text:render', function() {

  var testModel, scope, rootScope, container, element, timeout;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {
    data: {
      model: {
        choices: [],
        config: {
          availability: "all",
          label: "",
          selectionUnit: "custom",
          passage: "<p><span class=\"cst\">As</span> <span class=\"cst\">became</span> <span class=\"cst\">a</span> <span class=\"cst\">real</span> <span class=\"cst\">ghost</span>.</p>"
        }
      }
    },
    session: {
      answers: null
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
    });
  });

  beforeEach(inject(function($compile, $rootScope, $timeout) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-select-text-render id='1'></corespring-select-text-render>")($rootScope.$new());
    scope = element.isolateScope();
    rootScope = $rootScope;
    timeout = $timeout;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
    expect(element).not.toBe(undefined);
  });

  describe('isAnswerEmpty', function() {
    it('should return true initially', function() {
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      expect(container.elements['1'].isAnswerEmpty()).toBe(true);
    });
    it('should return false if answer is set initially', function() {
      testModel.session = {
        answers: [0]
      };
      container.elements['1'].setDataAndSession(testModel);
      rootScope.$digest();
      timeout.flush();
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
    it('should return false if answer is selected', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.userChoices = [4];
      expect(container.elements['1'].isAnswerEmpty()).toBe(false);
    });
  });

  it('should implement containerBridge', function() {
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
    });

    it('does not get called initially', function() {
      expect(changeHandlerCalled).toBe(false);
    });

    it('does get called when a token is selected', function() {
      scope.userChoices = [2];
      scope.$digest();
      expect(changeHandlerCalled).toBe(true);
    });
  });

  describe('order of setMode/setResponse', function() {
    var response;

    beforeEach(function() {
      container.elements['1'].setDataAndSession(_.cloneDeep(testModel));
      rootScope.$digest();

      response = {correctness: 'incorrect', feedback: {message: 'not good'}};
    });

    function assertFeedback() {
      rootScope.$digest();
      expect(scope.feedback).toEqual('not good');
    }

    it('should work when setMode is called before setResponse', function() {
      container.elements['1'].setMode('evaluate');
      container.elements['1'].setResponse(response);
      assertFeedback();
    });

    it('should work when setMode is called after setResponse', function() {
      container.elements['1'].setResponse(response);
      container.elements['1'].setMode('evaluate');
      assertFeedback();
    });
  });

});