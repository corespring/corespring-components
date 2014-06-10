describe('corespring line component', function() {

  var testModel, scope, rootScope, container, element, factory;

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

    element = $compile("<org-tag id='1'></org-tag>")($rootScope.$new());

    scope = element.scope();
    rootScope = $rootScope;
  }));

  beforeEach(inject(function (RenderWrapped) {
      factory = RenderWrapped;
  }));

  it('constructs line component', function() {
    expect(element).toNotBe(null);
  });

  it('factory should create', function() {
    var ob = new factory();
    expect(ob.ping()).toBeEqual('pong');
  });


});
