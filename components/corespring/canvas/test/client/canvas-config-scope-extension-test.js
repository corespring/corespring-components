// /* global describe, beforeEach, inject, module, it, expect */

describe('corespring:canvas:canvas-config-scope-extension', function() {
  'use strict';

  var scope;
  var defaults = {
    "graphTitle": "",
    "graphWidth": 500,
    "graphHeight": 500,
    "sigfigs": -1,
    "showCoordinates": true,
    "showInputs": true,
    "showAxisLabels": true,
    "showFeedback": true,
    "exhibitOnly": false,
    "domainLabel": "",
    "domainMin": -10,
    "domainMax": 10,
    "domainStepValue": 1,
    "domainSnapValue": 1,
    "domainLabelFrequency": 1,
    "domainGraphPadding": 50,
    "rangeLabel": "",
    "rangeMin": -10,
    "rangeMax": 10,
    "rangeStepValue": 1,
    "rangeSnapValue": 1,
    "rangeLabelFrequency": 1,
    "rangeGraphPadding": 50,
    "lines": [{ "id": 1, "equation": "", "intialLine": "", "label": "", "colorIndex": 0 }]
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($rootScope, CanvasConfigScopeExtension) {
    scope = $rootScope.$new();
    scope.defaults = defaults;
    scope.fullModel = {
      "model": {
        "config": {
          "graphTitle": "Custom",
          "graphWidth": 400,
          "graphHeight": 400,
          "sigfigs": 0,
          "showCoordinates": false,
          "showInputs": false,
          "showAxisLabels": false,
          "showFeedback": false,
          "exhibitOnly": true,
          "domainLabel": "Custom",
          "domainMin": -5,
          "domainMax": 5,
          "domainStepValue": 2,
          "domainSnapValue": 2,
          "domainLabelFrequency": 2,
          "domainGraphPadding": 25,
          "rangeLabel": "Custom",
          "rangeMin": -5,
          "rangeMax": 5,
          "rangeStepValue": 2,
          "rangeSnapValue": 2,
          "rangeLabelFrequency": 2,
          "rangeGraphPadding": 25,
          "lines": []
        }
      }
    };
    new CanvasConfigScopeExtension().postLink(scope);
    scope.$digest();
  }));

  it('should have a defined scope', function() {
    expect(scope).toBeDefined();
  });

  describe('resetCanvasGraphAttributes', function(){
    it('should exist', function() {
      expect(scope.resetCanvasGraphAttributes).toBeDefined();
    });

    it('should reset canvas graph properties', function(){

      scope.resetCanvasGraphAttributes();

      // graph attributes
      expect(scope.fullModel.model.config.domainMin).toEqual(scope.defaults.domainMin);
      expect(scope.fullModel.model.config.domainMax).toEqual(scope.defaults.domainMax);
      expect(scope.fullModel.model.config.domainLabel).toEqual(scope.defaults.domainLabel);
      expect(scope.fullModel.model.config.domainStepValue).toEqual(scope.defaults.domainStepValue);
      expect(scope.fullModel.model.config.domainSnapValue).toEqual(scope.defaults.domainSnapValue);
      expect(scope.fullModel.model.config.domainLabelFrequency).toEqual(scope.defaults.domainLabelFrequency);
      expect(scope.fullModel.model.config.domainGraphPadding).toEqual(scope.defaults.domainGraphPadding);

      expect(scope.fullModel.model.config.rangeMin).toEqual(scope.defaults.rangeMin);
      expect(scope.fullModel.model.config.rangeMax).toEqual(scope.defaults.rangeMax);
      expect(scope.fullModel.model.config.rangeLabel).toEqual(scope.defaults.rangeLabel);
      expect(scope.fullModel.model.config.rangeStepValue).toEqual(scope.defaults.rangeStepValue);
      expect(scope.fullModel.model.config.rangeSnapValue).toEqual(scope.defaults.rangeSnapValue);
      expect(scope.fullModel.model.config.rangeLabelFrequency).toEqual(scope.defaults.rangeLabelFrequency);
      expect(scope.fullModel.model.config.rangeGraphPadding).toEqual(scope.defaults.rangeGraphPadding);

      // significant figures
      expect(scope.fullModel.model.config.sigfigs).toEqual(scope.defaults.sigfigs);
    });
  });

  describe('resetCanvasDisplayAttributes', function(){
    it('should exist', function() {
      expect(scope.resetCanvasDisplayAttributes).toBeDefined();
    });

    it('should reset canvas display properties', function(){

      scope.resetCanvasDisplayAttributes();

      // graph attributes
      expect(scope.fullModel.model.config.graphTitle).toEqual(scope.defaults.graphTitle);
      expect(scope.fullModel.model.config.graphWidth).toEqual(scope.defaults.graphWidth);
      expect(scope.fullModel.model.config.graphHeight).toEqual(scope.defaults.graphHeight);

      expect(scope.fullModel.model.config.showCoordinates).toEqual(scope.defaults.showCoordinates);
      expect(scope.fullModel.model.config.showInputs).toEqual(scope.defaults.showInputs);
      expect(scope.fullModel.model.config.showAxisLabels).toEqual(scope.defaults.showAxisLabels);
      expect(scope.fullModel.model.config.showFeedback).toEqual(scope.defaults.showFeedback);
    });

  });

});