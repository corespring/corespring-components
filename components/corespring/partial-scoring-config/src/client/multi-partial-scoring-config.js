exports.framework = 'angular';
exports.directive = {
  name: "corespringMultiPartialScoringConfig",
  directive: [
    'LogFactory',
    corespringMultiPartialScoringConfig
  ]
};

/*
  Allows to configure multiples sections of partial scoring.
  The model looks like this.

  {
     sections: [
      {
        label: "some label",
        numberOfCorrectAnswers: 4,
        canAddScoringScenario: false,
        canRemoveScoringScenario: false,
        maxNumberOfScoringScenarios: 1,
        partialScoring: [
          {numberOfCorrect: 3, scorePercentage: 20},
          {numberOfCorrect: 2, scorePercentage: 10}
        ]
      }
     ]
  }

 */
function corespringMultiPartialScoringConfig(LogFactory) {

  var $log = LogFactory.getLogger('MultiPartialScoringConfig');

  return {
    scope: {
      model: '=',
      allowPartialScoring: '='
    },
    restrict: 'E',
    replace: true,
    link: link,
    template: template()
  };

  function link(scope, elem, attr) {
    scope.addScoringScenario = addScoringScenario;
    scope.removeScoringScenario = removeScoringScenario;
    scope.togglePartialScoring = togglePartialScoring;
    scope.updateNumberOfCorrectResponses = updatePartialScoringModel;

    scope.$watch('model', function(newValue) {
      scope.updateNumberOfCorrectResponses();
    }, true);

    //--------------------------------------------------------------

    function togglePartialScoring() {
      if (isAllowedToConfigurePartialScoring()) {
        scope.allowPartialScoring = !scope.allowPartialScoring;
      }
    }

    function isAllowedToConfigurePartialScoring(){
      return getMaxNumberOfCorrectResponses() > 1;
    }

    function getMaxNumberOfCorrectResponses(){
      return _.reduce(scope.model.sections, function(acc,section){
        return Math.max(section.numberOfCorrectResponses, acc);
      }, 0);
    }

    function addScoringScenario(section) {
      var maxNumberOfCorrect = findMaxNumberOfCorrectInScoringScenarios(section);
      section.partialScoring.push(makeScenario(maxNumberOfCorrect + 1, 20));

      function findMaxNumberOfCorrectInScoringScenarios(section) {
        var maxNumberOfCorrect = 0;
        _.each(section.partialScoring, function(ps) {
          if (ps.numberOfCorrect > maxNumberOfCorrect) {
            maxNumberOfCorrect = ps.numberOfCorrect;
          }
        });
        return maxNumberOfCorrect;
      }
    }

    function removeScoringScenario(section, index) {
      section.partialScoring.splice(index,1);
    }

    function updatePartialScoringModel() {
      /*
      if (isNaN(numberOfCorrectResponses) || !scope.fullModel) {
        return;
      }

      if (!scope.fullModel.partialScoring) {
        scope.fullModel.partialScoring = [makeScenario(1, 25)];
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
      */
    }

    function makeScenario(numberOfCorrect, scorePercentage) {
      return {
        numberOfCorrect: numberOfCorrect,
        scorePercentage: scorePercentage
      };
    }
  }

  function template() {
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
      ].join('');
  }
}