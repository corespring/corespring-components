/* global describe, beforeEach, inject, module, it, expect */

describe('choice-template-scope-extension partial-scoring', function(){
  'use strict';

  var scope;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($rootScope, ChoiceTemplateScopeExtension) {
    scope = $rootScope.$new();
    scope.fullModel = {allowPartialScoring:true, partialScoring:[]};
    new ChoiceTemplateScopeExtension().postLink(scope);
  }));

  it('scope', function() {
    expect(scope).not.toBeUndefined();
  });

  describe('addScoringScenario', function(){
    it('should exist', function() {
      expect(scope.addScoringScenario).not.toBeUndefined();
    });

    it('should add a scenario', function(){
      scope.addScoringScenario();
      expect(scope.fullModel.partialScoring.length).toEqual(1);
      expect(scope.fullModel.partialScoring[0]).toEqual({numberOfCorrect: 1, scorePercentage: 20});
    });

  });

  describe('togglePartialScoring', function(){
    it('should exist', function(){
      expect(scope.togglePartialScoring).not.toBeUndefined();
    });
    it('should toggle allowPartialScoring', function(){
      scope.fullModel.allowPartialScoring = true;
      scope.togglePartialScoring();
      expect(scope.fullModel.allowPartialScoring).toBe(false);
    });
    it('should not toggle allowPartialScoring if isSingleChoice returns true', function(){
      scope.fullModel.allowPartialScoring = true;
      scope.isSingleChoice = function(){return true;};
      scope.togglePartialScoring();
      expect(scope.fullModel.allowPartialScoring).toBe(true);
    });
    it('should toggle allowPartialScoring if isSingleChoice returns false', function(){
      scope.fullModel.allowPartialScoring = true;
      scope.isSingleChoice = function(){return false;};
      scope.togglePartialScoring();
      expect(scope.fullModel.allowPartialScoring).toBe(false);
    });
  });

  describe('partialScoring', function(){
    it('should exist', function(){
      expect(scope.partialScoring).not.toBeUndefined();
    });
    it('should return allowPartialScoring', function(){
      scope.fullModel.allowPartialScoring = true;
      expect(scope.partialScoring()).toBe(true);
      scope.fullModel.allowPartialScoring = false;
      expect(scope.partialScoring()).toBe(false);
    });
    it('should return false, if singleChoice is true', function(){
      scope.isSingleChoice = function(){return true;};
      scope.fullModel.allowPartialScoring = true;
      expect(scope.partialScoring()).toBe(false);
    });
    it('should return allowPartialScoring, if singleChoice is false', function(){
      scope.isSingleChoice = function(){return false;};
      scope.fullModel.allowPartialScoring = true;
      expect(scope.partialScoring()).toBe(true);
      scope.fullModel.allowPartialScoring = false;
      expect(scope.partialScoring()).toBe(false);
    });
  });
  describe('removeScoringScenario', function(){
    it('should exist', function(){
      expect(scope.removeScoringScenario).not.toBeUndefined();
    });
    it('should remove scoringScenario', function(){
      var scoringScenario = {};
      scope.fullModel.partialScoring.push(scoringScenario);
      scope.removeScoringScenario(scoringScenario);
      expect(scope.fullModel.partialScoring.length).toEqual(0);
    });
  });


});