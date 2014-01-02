describe('corespring', function () {

  var testModel, scope, rootScope;

  var MockComponentRegister = function () {
    this.elements = {};
    this.registerComponent = function (id, bridge) {
      this.elements[id] = bridge;
    }
  };

  var testModelTemplate = {
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function () {
    module(function ($provide) {
      testModel = _.cloneDeep(testModelTemplate);
    });
  });

  beforeEach(inject(function ($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function (event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-select-text id='1'></corespring-select-text>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
  }));

  it('constructs', function () {
//    expect(element).toNotBe(null);
  });


});
