/*global describe,inject,beforeEach,it,expect,module*/
describe('corespring:calculator:render', function() {

  var MockComponentRegister = function () {
    this.elements = {};
    this.registerComponent = function (id, bridge) {      
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container, testModel;

  var testModelTemplate = {
      "title": "Calculator",
      "isTool" : true,
      "componentType": "corespring-calculator",
      "weight": 0,
      "model": {
        "config": {
          "type": "basic"      
        }
      }
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

    element = $compile("<corespring-calculator id='1'></corespring-calculator>")($rootScope.$new());
    scope = element.scope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).toNotBe(null);
  });
  
});