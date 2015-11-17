/* global describe, beforeEach, inject, module, it, expect */

describe('corespring:canvas:canvas-templates', function() {
  'use strict';

  var scope, element;
  var canvasTemplates;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($rootScope, CanvasTemplates) {
    scope = $rootScope.$new();
    canvasTemplates = CanvasTemplates;
    canvasTemplates.extendScope(scope, 'corespring-canvas-templates-test');
    scope.$digest();
  }));

  it('should be defined', function() {
    expect(scope).toBeDefined();
    expect(canvasTemplates).toBeDefined();
  });

  describe('configGraph', function(){

    it('should be defined', function() {
      expect(canvasTemplates.configGraph).toBeDefined();
    });

    it('should define an attributes form', function() {
      element = angular.element(canvasTemplates.configGraph());
      expect(element).toBeDefined();
      expect(element.find("form[name=attributesForm]").length).toBe(1);
    });

  });

  describe('configDisplay', function(){

    it('should be defined', function() {
      expect(canvasTemplates.configDisplay).toBeDefined();
    });

    it('should define a display form', function() {
      element = angular.element(canvasTemplates.configDisplay());
      expect(element).toBeDefined();
      expect(element.find("form[name=displayForm]").length).toBe(1);
    });

  });

});