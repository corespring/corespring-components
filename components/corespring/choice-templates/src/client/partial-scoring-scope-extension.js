/* global exports */

exports.framework = "angular";
exports.factory = [
  '$log',

  function($log) {

    "use strict";

    function PartialScoringScopeExtension() {

      this.postLink = function(scope) {

        scope.canAddScoringScenario = function(){
          return scope.fullModel.partialScoring.length + 1 < scope.model.choices.length;
        };

        scope.addScoringScenario = function() {
          function findMaxNumberOfCorrectInScoringScenarios(){
            var maxNumberOfCorrect = 0;
            _.each(scope.fullModel.partialScoring, function(ps) {
              if (ps.numberOfCorrect > maxNumberOfCorrect) {
                maxNumberOfCorrect = ps.numberOfCorrect;
              }
            });
            return maxNumberOfCorrect;
          }
          var maxNumberOfCorrect = findMaxNumberOfCorrectInScoringScenarios();
          scope.fullModel.partialScoring.push({
            numberOfCorrect: maxNumberOfCorrect + 1,
            scorePercentage: 20
          });
        };

        scope.togglePartialScoring = function() {
          scope.fullModel.allowPartialScoring = !scope.fullModel.allowPartialScoring;
        };

        scope.removeScoringScenario = function(scoringScenario) {
          scope.fullModel.partialScoring = _.filter(scope.fullModel.partialScoring, function(ps) {
            return ps !== scoringScenario;
          });
        };

        scope.numberOfCorrectResponses = 0;
        scope.maxNumberOfScoringScenarios = 1;
        scope.canAddScoringScenario = false;
        scope.canRemoveScoringScenario = false;

        scope.updatePartialScoringModel = function(numberOfCorrectResponses){
          if(!scope.fullModel.partialScoring){
            scope.fullModel.partialScoring = [];
          }
          scope.numberOfCorrectResponses = Math.max(0,numberOfCorrectResponses);
          scope.maxNumberOfScoringScenarios = Math.max( 1, scope.numberOfCorrectResponses-1);
          scope.canAddScoringScenario = scope.fullModel.partialScoring.length < scope.maxNumberOfScoringScenarios;
          scope.canRemoveScoringScenario = scope.fullModel.partialScoring.length > 1;

          if(scope.fullModel.partialScoring.length > scope.maxNumberOfScoringScenarios){
            scope.fullModel.partialScoring = _.filter(scope.fullModel.partialScoring, function(ps){
              return ps.numberOfCorrect <= 1 || ps.numberOfCorrect < scope.numberOfCorrectResponses;
            });
          }
        };

        scope.$watch('fullModel.partialScoring.length', function(){
          scope.updatePartialScoringModel(scope.numberOfCorrectResponses);
        });

      };
    }

    return PartialScoringScopeExtension;
  }
];
