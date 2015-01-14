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
          var maxNumberOfCorrect = 0;
          _.each(scope.fullModel.partialScoring, function(ps) {
            if (ps.numberOfCorrect > maxNumberOfCorrect) {
              maxNumberOfCorrect = ps.numberOfCorrect;
            }
          });
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

        scope.removeAdditionalScoringScenarios = function(numberOfCorrectChoices){
          scope.fullModel.partialScoring = _.filter(scope.fullModel.partialScoring, function(ps){
            return ps.numberOfCorrect === 1 || ps.numberOfCorrect < numberOfCorrectChoices;
          });
        };

      };
    }

    return PartialScoringScopeExtension;
  }
];
