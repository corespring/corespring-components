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

  describe('toChar', function(){
    it('should exist', function() {
      expect(scope.toChar).toBeDefined();
    });

    it('should convert a number', function(){
      var result = scope.toChar(3);
      expect(result).toEqual('D');
    });

    it('should accept a Nan', function(){
      var result = scope.toChar(NaN);
      expect(result).toEqual('A');
    });
    it('should accept a null', function(){
      var result = scope.toChar(null);
      expect(result).toEqual('A');
    });
    it('should accept a undefined', function(){
      var result = scope.toChar(undefined);
      expect(result).toEqual('A');
    });
  });
});