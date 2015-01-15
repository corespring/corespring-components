/* global describe, beforeEach, inject, module, it, expect */

describe('choice-template-scope-extension partial-scoring', function(){
  'use strict';

  var scope;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($rootScope, PartialScoringScopeExtension) {
    scope = $rootScope.$new();
    scope.fullModel = {allowPartialScoring:true, partialScoring: [{"numberOfCorrect": 1, "scorePercentage": 25}]};
    new PartialScoringScopeExtension().postLink(scope);
    scope.$digest();
  }));

  it('scope', function() {
    expect(scope).not.toBeUndefined();
  });

  describe('addScoringScenario', function(){
    it('should exist', function() {
      expect(scope.addScoringScenario).not.toBeUndefined();
    });

    it('should add a scenario', function(){
      scope.updatePartialScoringModel(3); //make sure we are allowed to add one, otherwise it will be removed on digest
      scope.addScoringScenario();
      expect(scope.fullModel.partialScoring.length).toEqual(2);
      expect(scope.fullModel.partialScoring[1]).toEqual({numberOfCorrect: 2, scorePercentage: 20});
    });

  });

  describe('togglePartialScoring', function(){
    it('should exist', function(){
      expect(scope.togglePartialScoring).not.toBeUndefined();
    });
    it('should toggle allowPartialScoring', function(){
      scope.numberOfCorrectResponses = 2;
      scope.fullModel.allowPartialScoring = true;
      scope.togglePartialScoring();
      scope.$digest();
      expect(scope.fullModel.allowPartialScoring).toBe(false);
    });
    it('should not toggle allowPartialScoring, if numberOfCorrectResponses is 1 or less', function(){
      scope.numberOfCorrectResponses = 1;
      scope.fullModel.allowPartialScoring = true;
      scope.togglePartialScoring();
      scope.$digest();
      expect(scope.fullModel.allowPartialScoring).toBe(true);
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
      expect(scope.fullModel.partialScoring.length).toEqual(1);
    });
  });

  describe('updatePartialScoringModel', function() {
    it('should exist', function () {
      expect(scope.updatePartialScoringModel).not.toBeUndefined();
    });

    describe('numberOfCorrectResponses', function () {
      it('should be set to the value passed in', function () {
        scope.updatePartialScoringModel(123);
        scope.$digest();
        expect(scope.numberOfCorrectResponses).toEqual(123);
      });
      it('should accept negative numbers', function () {
        scope.updatePartialScoringModel(-1);
        scope.$digest();
        expect(scope.numberOfCorrectResponses).toEqual(0);
      });
      it('should accept undefined', function () {
        scope.updatePartialScoringModel(undefined);
        scope.$digest();
        expect(scope.numberOfCorrectResponses).toEqual(0);
      });
      it('should accept null', function () {
        scope.updatePartialScoringModel(null);
        scope.$digest();
        expect(scope.numberOfCorrectResponses).toEqual(0);
      });
      it('should accept NaN', function () {
        scope.updatePartialScoringModel(NaN);
        scope.$digest();
        expect(scope.numberOfCorrectResponses).toEqual(0);
      });
    });

    describe('maxNumberOfScoringScenarios', function () {
      it('should be one less that the correct answers', function () {
        scope.updatePartialScoringModel(123);
        scope.$digest();
        expect(scope.maxNumberOfScoringScenarios).toEqual(123 - 1);
      });
      it('should have a minimum of 1', function () {
        scope.updatePartialScoringModel(0);
        scope.$digest();
        expect(scope.maxNumberOfScoringScenarios).toEqual(1);
      });
    });

    describe('canAddScoringScenario', function () {
      it("should be false if we cannot add a scenario", function () {
        scope.updatePartialScoringModel(2);
        scope.$digest();
        expect(scope.canAddScoringScenario).toBe(false);
      });
      it("should be true if we can add a scenario", function () {
        scope.updatePartialScoringModel(3);
        scope.$digest();
        expect(scope.canAddScoringScenario).toBe(true);
      });
      it("should be false if we cannot add a scenario", function () {
        scope.updatePartialScoringModel(3);
        scope.addScoringScenario();
        scope.$digest();
        expect(scope.canAddScoringScenario).toBe(false);
      });
    });

    describe('canRemoveScoringScenario', function () {
      it("should be false if we have 1 or less scenarios", function () {
        scope.updatePartialScoringModel(1);
        scope.$digest();
        expect(scope.canRemoveScoringScenario).toBe(false);
      });

      it("should be true if we have 2 or more scenarios", function () {
        scope.updatePartialScoringModel(3);
        scope.addScoringScenario();
        scope.$digest();
        expect(scope.canRemoveScoringScenario).toBe(true);
      });
    });

    describe('automatic removal of scenarios', function(){
      it('should remove scenarios if we have more scenarios than allowed', function(){
        scope.updatePartialScoringModel(3);
        scope.addScoringScenario();
        scope.$digest();
        expect(scope.fullModel.partialScoring.length).toEqual(2);
        scope.updatePartialScoringModel(2);
        scope.$digest();
        expect(scope.fullModel.partialScoring.length).toEqual(1);
      });

      it('should not remove the first scenario', function(){
        scope.updatePartialScoringModel(3);
        scope.addScoringScenario();
        scope.$digest();
        expect(scope.fullModel.partialScoring.length).toEqual(2);
        scope.updatePartialScoringModel(0);
        scope.$digest();
        expect(scope.fullModel.partialScoring.length).toEqual(1);
      });
    });
  });
});