/*global describe,inject,beforeEach,it,expect,module*/
describe('corespring:calculator:configure', function() {

  "use strict";

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null, scope, container = null, rootScope;

  function createTestModel() {
    return {
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
  }

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($compile, $rootScope) {
    scope = $rootScope.$new();
    container = new MockComponentRegister();

    $rootScope.$on('registerConfigPanel', function(ev, id, b) {
      container.registerConfigPanel(id, b);
    });

    $rootScope.registerConfigPanel = function(id, b) {
      container.registerConfigPanel(id, b);
    };
    element = $compile("<div navigator=''><corespring-calculator-configure id='1'></corespring-calculator-configure></div>")(scope);
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  it('constructs', function() {
    expect(element).not.toBe(null);
  });
});
