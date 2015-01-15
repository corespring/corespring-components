/* global describe, beforeEach, inject, module, it, expect */

describe('choice-template-scope-extension partial-scoring', function(){
  'use strict';

  var scope;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($rootScope, PartialScoringScopeExtension) {
    scope = $rootScope.$new();
    scope.fullModel = {allowPartialScoring:true, partialScoring:[]};
    new PartialScoringScopeExtension().postLink(scope);
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

  describe('updatePartialScoringModel', function(){
    it('should exist', function(){
      expect(scope.updatePartialScoringModel).not.toBeUndefined();
    });
    it('should create')
  });


});