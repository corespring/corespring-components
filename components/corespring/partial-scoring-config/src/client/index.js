// module: corespring.choice-templates
// service: PartialScoringConfig
/* global exports */
exports.framework = "angular";
exports.service = [
  'LogFactory',
  function(LogFactory) {

    "use strict";

    function PartialScoringConfig() {

      var $log = LogFactory.getLogger('PartialScoringConfig');

      this.extendScope = function(scope, componentType) {

        scope.canAddScoringScenario = false;
        scope.canRemoveScoringScenario = false;
        scope.maxNumberOfScoringScenarios = 1;
        scope.numberOfCorrectResponses = 0;

        scope.addScoringScenario = addScoringScenario;
        scope.removeScoringScenario = removeScoringScenario;
        scope.togglePartialScoring = togglePartialScoring;
        scope.updatePartialScoringModel = updatePartialScoringModel;

        scope.$watch('fullModel.partialScoring.length', function() {
          scope.updatePartialScoringModel(scope.numberOfCorrectResponses);
        });

        //--------------------------------------------------------------

        function addScoringScenario() {
          function findMaxNumberOfCorrectInScoringScenarios() {
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
        }

        function togglePartialScoring() {
          if (scope.numberOfCorrectResponses > 1) {
            scope.fullModel.allowPartialScoring = !scope.fullModel.allowPartialScoring;
          }
        }

        function removeScoringScenario(scoringScenario) {
          scope.fullModel.partialScoring = _.filter(scope.fullModel.partialScoring, function(ps) {
            return ps !== scoringScenario;
          });
        }

        function updatePartialScoringModel(numberOfCorrectResponses) {
          if (!scope.fullModel.partialScoring) {
            scope.fullModel.partialScoring = [{
              "numberOfCorrect": 1,
              "scorePercentage": 25
            }];
          }
          scope.numberOfCorrectResponses = Math.max(0, isNaN(numberOfCorrectResponses) ? 0 : numberOfCorrectResponses);
          scope.maxNumberOfScoringScenarios = Math.max(1, scope.numberOfCorrectResponses - 1);
          scope.canAddScoringScenario = scope.fullModel.partialScoring.length < scope.maxNumberOfScoringScenarios;
          scope.canRemoveScoringScenario = scope.fullModel.partialScoring.length > 1;

          if (scope.fullModel.partialScoring.length > scope.maxNumberOfScoringScenarios) {
            scope.fullModel.partialScoring = _.filter(scope.fullModel.partialScoring, function(ps) {
              return ps.numberOfCorrect <= 1 || ps.numberOfCorrect < scope.numberOfCorrectResponses;
            });
          }
        }
      };

      this.scoringPanel = function() {
        return [
          '<div class="corespring-partial-scoring">',
          '  <div class="scoring-header-text">',
          '   If there is more than one correct answer to this ',
          '   question, you may allow partial credit based on the ',
          '   number of correct answers submitted. This is optional.',
          '  </div>',
          '  <div class="panel panel-default" ng-class="{disabled: numberOfCorrectResponses <= 1}">',
          '   <div class="panel-heading">',
          '     <h4 class="panel-title">',
          '       <a ng-click="togglePartialScoring()">',
          '         <span class="icon">',
          '           <i class="fa fa-{{fullModel.allowPartialScoring ? \'minus\' : \'plus\'}}-circle"></i>',
          '         </span>',
          '         Partial Scoring Rules',
          '       </a>',
          '     </h4>',
          '   </div>',
          '   <div class="partial-scoring">',
          '     <div class="panel-body" collapse="numberOfCorrectResponses <= 1 || !fullModel.allowPartialScoring">',
          '       <ul class="list-unstyled">',
          '         <li class="scoring-item" ng-repeat="scenario in fullModel.partialScoring">',
          '           If',
          '           <input class="form-control" type="number" min="1" max="{{maxNumberOfScoringScenarios}}" ng-model="scenario.numberOfCorrect"/>',
          '           of correct answers is selected, award',
          '           <input class="form-control" type="number" min="1" max="99" ng-model="scenario.scorePercentage"/>',
          '           % of full credit.',
          '           <i class="fa fa-trash-o remove-item" ng-show="canRemoveScoringScenario" ng-click="removeScoringScenario(scenario)"></i>',
          '         </li>',
          '       </ul>',
          '       <div class="text-right">',
          '         <button class="btn btn-default" ng-click="addScoringScenario()" ng-show="canAddScoringScenario">',
          '           <i class="fa fa-plus"/>',
          '           Add another scenario',
          '         </button>',
          '       </div>',
          '     </div>',
          '   </div>',
          '  </div>',
          '</div>'
        ].join('\n');
      };
    }

    return new PartialScoringConfig();
}];