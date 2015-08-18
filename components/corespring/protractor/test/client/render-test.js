/*global describe,inject,beforeEach,it,expect,module*/
describe('corespring:protractor:render', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container, protractorWidget;

  var testModel;

  var testModelTemplate = {
    data: {
      "title": "Protractor",
      "componentType": "corespring-protractor",
      "weight": 0,
      "isTool": true,
      "noEdit": true,
      "model": {
        "config": {}
      }
    }
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(function() {
    module(function($provide) {
      testModel = _.cloneDeep(testModelTemplate);
      $provide.value('KhanUtil', {});
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    container = new MockComponentRegister();

    $rootScope.$on('registerComponent', function(event, id, obj) {
      container.registerComponent(id, obj);
    });

    element = $compile("<corespring-protractor-render id='1'></corespring-protractor-render>")($rootScope.$new());
    protractorWidget = element.find('.cs-protractor-widget');
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  describe('initialization', function() {
    it('constructs', function() {
      expect(element).toNotBe(null);
      expect(protractorWidget).toBeDefined();
    });

    it('sets model', function() {
      container.elements['1'].setDataAndSession(testModel);
      expect(scope.isVisible).toBe(false);
    });
  });

  it('should implement containerBridge',function(){
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

});