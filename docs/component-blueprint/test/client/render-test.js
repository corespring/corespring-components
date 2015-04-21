describe('corespring:blueprint:render', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container;

  var testModel;

  var testModelTemplate = {
    data: {
      "model": {
        //TODO define render model
      }
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
      console.log('registerComponent');
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-blueprint-render id='1'></corespring-blueprint-render>")($rootScope.$new());
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });

  it('sets model', function() {
    container.elements['1'].setDataAndSession(testModel);
    expect(scope.question).toNotBe(null);
    expect(scope.inputType).toBe('radiobutton');
  });

});