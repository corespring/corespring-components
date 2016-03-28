describe('corespring:box-and-whiskers:render', function() {

  var testModel, scope, rootScope, container, element;

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var testModelTemplate = {};

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

    element = $compile("<corespring-box-and-whiskers-render id='1'></corespring-box-and-whiskers-render>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
  }));

  /* Component not testable

  it('constructs', function() {
    expect(element).not.toBe(null);
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
*/

});
