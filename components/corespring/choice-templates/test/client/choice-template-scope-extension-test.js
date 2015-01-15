/* global describe, beforeEach, inject, module, it, expect */

describe('choice-template-scope-extension', function(){
  'use strict';

  var scope;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($rootScope, ChoiceTemplateScopeExtension) {
    scope = $rootScope.$new();
    new ChoiceTemplateScopeExtension().postLink(scope);
    scope.$digest();
  }));

  it('scope', function() {
    expect(scope).toBeDefined();
  });

  describe('numToString', function(){
    it('should exist', function() {
      expect(scope.numToString).toBeDefined();
    });

    it('should convert a number', function(){
      var result = scope.numToString(3);
      expect(result).toEqual('3');
    });

    it('should accept a Nan', function(){
      var result = scope.numToString(NaN);
      expect(result).toEqual('0');
    });
    it('should accept a null', function(){
      var result = scope.numToString(null);
      expect(result).toEqual('0');
    });
    it('should accept a undefined', function(){
      var result = scope.numToString(undefined);
      expect(result).toEqual('0');
    });
  });
});