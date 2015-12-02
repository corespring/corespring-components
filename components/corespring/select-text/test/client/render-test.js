describe('corespring:select-text:render', function() {

  var testModel, scope, rootScope, container, element;

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
          passage: "<p><span class=\"cs-token\">As</span> <span class=\"cs-token\">became</span> <span class=\"cs-token\">a</span> <span class=\"cs-token\">real</span> <span class=\"cs-token\">ghost</span>.</p>"
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

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-select-text-render id='1'></corespring-select-text-render>")($rootScope.$new());
    scope = element.isolateScope();
    rootScope = $rootScope;
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

  describe('instructor data', function() {
    xit('setting instructor data should select correct answers', function() {
      container.elements['1'].setDataAndSession(testModel);
      scope.$digest();
      container.elements['1'].setInstructorData({
        correctResponse: {
          value: [1]
        }
      });
      scope.$digest();
      expect(element.find('.correct').length).toEqual(1);
    });
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

});