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
          if (!_.isFunction(scope.isSingleChoice) || !scope.isSingleChoice()) {
            scope.fullModel.allowPartialScoring = !scope.fullModel.allowPartialScoring;
          }
        };

        scope.partialScoring = function() {
          return (_.isFunction(scope.isSingleChoice)) ? (!scope.isSingleChoice() && scope.fullModel.allowPartialScoring)
            : scope.fullModel.allowPartialScoring;
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

        function updateNumberOfCorrectResponses(){
          scope.numberOfCorrectResponses = scope.fullModel && scope.fullModel.correctResponse &&
          _.isArray(scope.fullModel.correctResponse.value) ? scope.fullModel.correctResponse.value.length : 0;
        }

        function updateMaxNumberOfScoringScenarios(){
          scope.maxNumberOfScoringScenarios = Math.max( 1, scope.numberOfCorrectResponses-1);
        }

        function updateCanAddScoringScenario(){
          scope.canAddScoringScenario = scope.fullModel.partialScoring.length < scope.maxNumberOfScoringScenarios;
        }

        function updateCanRemoveScoringScenario(){
          scope.canRemoveScoringScenario = scope.fullModel.partialScoring.length > 1;
        }

        function removeAdditionalScoringScenarios(){
          if(scope.fullModel.partialScoring.length > scope.maxNumberOfScoringScenarios){
            scope.fullModel.partialScoring = _.filter(scope.fullModel.partialScoring, function(ps){
              return ps.numberOfCorrect === 1 || ps.numberOfCorrect < scope.numberOfCorrectResponses;
            });
          }
        }

        function updatePartialScoringUiModel(){
          updateNumberOfCorrectResponses();
          updateMaxNumberOfScoringScenarios();
          updateCanAddScoringScenario();
          updateCanRemoveScoringScenario();

          removeAdditionalScoringScenarios();
        }

        scope.$watch('fullModel.partialScoring.length', updatePartialScoringUiModel);

        scope.$watch('fullModel.correctResponse.value.length', updatePartialScoringUiModel);

      };
    }

    return PartialScoringScopeExtension;
  }
];
