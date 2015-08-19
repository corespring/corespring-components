/*global describe,inject,beforeEach,it,expect,module*/
describe('corespring:ruler:render', function() {

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerComponent = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element, scope, rootScope, container, rulerWidget;

  var testModel;

  var testModelTemplate = {
    data: {
      "title": "Ruler",
      "componentType": "corespring-ruler",
      "weight": 0,
      "isTool": true,
      "model": {
        "config": {
          "units": "imperial",
          "label": "in",
          "length": 12,
          "pixelsPerUnit": 40,
          "ticks": 16
        }
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

    element = $compile("<corespring-ruler-render id='1'></corespring-ruler-render>")($rootScope.$new());
    rulerWidget = element.find('.cs-ruler-widget');
    scope = element.scope().$$childHead;
    rootScope = $rootScope;
  }));

  describe('initialization', function() {
    it('constructs', function() {
      expect(element).not.toBe(null);
      expect(rulerWidget).toBeDefined();
    });

    it('sets model', function() {
      container.elements['1'].setDataAndSession(testModel);
      expect(scope.isVisible).toBe(false);
    });
  });

  it('should implement containerBridge', function() {
    expect(corespringComponentsTestLib.verifyContainerBridge(container.elements['1'])).toBe('ok');
  });

});