describe('corespring:number-line:configure', function() {

  "use strict";

  var MockComponentRegister = function() {
    this.elements = {};
    this.registerConfigPanel = function(id, bridge) {
      this.elements[id] = bridge;
    };
  };

  var element = null,
    container = null,
    scope, rootScope;

  beforeEach(angular.mock.module('test-app'));

  var MockComponentDefaultData = {
    getDefaultData: function() {
      return {};
    }
  };

  var MockServerLogic = {
    load: function() {
      return {
        defaults: {},
        keys: {}
      };
    }
  };

  beforeEach(function() {
    module(function($provide) {
      $provide.value('ServerLogic', MockServerLogic);
      $provide.value('ComponentDefaultData', MockComponentDefaultData);
    });
  });

  beforeEach(inject(function($compile, $rootScope) {
    scope = $rootScope.$new();
    container = new MockComponentRegister();

    $rootScope.$on('registerConfigPanel', function(ev, id, b) {
      container.registerConfigPanel(id, b);
    });

    $rootScope.registerConfigPanel = function(id, b) {
      container.registerConfigPanel(id, b);
    };
    element = $compile("<div navigator=''><corespring-number-line-configure id='1'></corespring-number-line-configure></div>")(scope);
    element = element.find('.config-number-line');
    scope = element.scope();
    console.log(scope);
    rootScope = $rootScope;
  }));

  describe('displayNone', function() {

    beforeEach(function() {
      scope.fullModel = {
        correctResponse: [],
        model: {
          config: {
            availableTypes: {
              "PF": true,
              "PE": true,
              "LEE": true,
              "LEF": true,
              "LFE": true,
              "LFF": true,
              "REP": true,
              "REN": true,
              "RFP": true,
              "RFN": true
            }
          }
        }
      };
    });

    it('should set all availableTypes to false', function() {
      scope.displayNone();
      _.each(scope.fullModel.model.config.availableTypes, function(value, key) {
        expect(value).toBe(false);
      });
    });

    describe('correctResponse contains PF', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "point",
            "pointType" : "full"
          }
        ]
      });

      it("should not set availableTypes['PF'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['PF']).toBe(true);
      });

    });

    describe('correctResponse contains PE', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "point",
            "pointType" : "empty"
          }
        ]
      });

      it("should not set availableTypes['PE'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['PE']).toBe(true);
      });

    });

    describe('correctResponse contains LEE', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "line",
            "leftPoint" : "empty",
            "rightPoint" : "empty"
          }
        ]
      });

      it("should not set availableTypes['LEE'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['LEE']).toBe(true);
      });

    });

    describe('correctResponse contains LEF', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "line",
            "leftPoint" : "empty",
            "rightPoint" : "full"
          }
        ]
      });

      it("should not set availableTypes['LEF'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['LEF']).toBe(true);
      });

    });

    describe('correctResponse contains LFE', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "line",
            "leftPoint" : "full",
            "rightPoint" : "empty"
          }
        ]
      });

      it("should not set availableTypes['LFE'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['LFE']).toBe(true);
      });

    });

    describe('correctResponse contains LFF', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "line",
            "leftPoint" : "full",
            "rightPoint" : "full"
          }
        ]
      });

      it("should not set availableTypes['LFF'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['LFF']).toBe(true);
      });

    });

    describe('correctResponse contains REP', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "ray",
            "pointType" : "empty",
            "direction" : "positive"
          }
        ]
      });

      it("should not set availableTypes['REP'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['REP']).toBe(true);
      });

    });

    describe('correctResponse contains REN', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "ray",
            "pointType" : "empty",
            "direction" : "negative"
          }
        ]
      });

      it("should not set availableTypes['REN'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['REN']).toBe(true);
      });

    });

    describe('correctResponse contains RFP', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "ray",
            "pointType" : "full",
            "direction" : "positive"
          }
        ]
      });

      it("should not set availableTypes['RFP'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['RFP']).toBe(true);
      });

    });

    describe('correctResponse contains RFN', function() {

      beforeEach(function() {
        scope.fullModel.correctResponse = [
          {
            "type" : "ray",
            "pointType" : "full",
            "direction" : "negative"
          }
        ]
      });

      it("should not set availableTypes['RFN'] to false", function() {
        scope.displayNone();
        expect(scope.fullModel.model.config.availableTypes['RFN']).toBe(true);
      });

    });

  });

});