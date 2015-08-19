describe('corespring:ruler:configure', function() {

  "use strict";

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null,
  scope,
  container = null,
  rootScope,
  testModel;

  function createTestModel() {
    return {
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

    element = $compile("<div navigator=''><corespring-ruler-configure id='1'></corespring-ruler-configure></div>")(scope);
    element = element.find('.cs-ruler-config');
    scope = element.isolateScope();
    rootScope = $rootScope;
  }));

  describe('initialization', function() {
    it('constructs', function() {
      expect(element).not.toBe(null);
    });

    it('sets model', function() {
      testModel = createTestModel();
      container.elements['1'].setModel(testModel);
    });
  });

  describe('initial settings', function() {
    beforeEach(function() {
      container.elements['1'].setModel(testModel);
    });

    it('should have imperial units by default', function() {
      expect(scope.model.config.units).toEqual("imperial");
    });

    it('should have inches label by default', function() {
      expect(scope.model.config.label).toEqual("in");
    });

    it('should have a length of 12 by default', function() {
      expect(scope.model.config.length).toEqual(12);
    });

    it('should have 40 pixels per unit by default', function() {
      expect(scope.model.config.pixelsPerUnit).toEqual(40);
    });

    it('should have 16 ticks by default', function() {
      expect(scope.model.config.ticks).toEqual(16);
    });
  });

  describe('changing units type', function() {
    beforeEach(function() {
      container.elements['1'].setModel(testModel);
      scope.model.config.units = "metric";
      scope.handleUnitsChange();
    });

    it('should have metric units', function() {
      expect(scope.model.config.units).toEqual("metric");
    });

    it('should have centimeters label', function() {
      expect(scope.model.config.label).toEqual("cm");
    });

    it('should have a length of 20', function() {
      expect(scope.model.config.length).toEqual(20);
    });

    it('should have 30 pixels per unit', function() {
      expect(scope.model.config.pixelsPerUnit).toEqual(30);
    });

    it('should have 10 ticks', function() {
      expect(scope.model.config.ticks).toEqual(10);
    });
  });

});
