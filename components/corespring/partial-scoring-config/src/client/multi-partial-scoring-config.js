exports.framework = 'angular';
exports.directive = {
  name: "corespringMultiPartialScoringConfig",
  directive: [
    '$sce',
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
function corespringMultiPartialScoringConfig($sce,LogFactory) {

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
    $log.debug("link", scope.model);

    scope.addScoringScenario = addScoringScenario;
    scope.isAllowedToConfigurePartialScoring = isAllowedToConfigurePartialScoring;
    scope.removeScoringScenario = removeScoringScenario;
    scope.togglePartialScoring = togglePartialScoring;
    scope.updatePartialScoringModel = updatePartialScoringModel;

    scope.$watch('model', function(newValue) {
      scope.updatePartialScoringModel();
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
      var result = _.reduce(scope.model.sections, function(acc,section){
        return Math.max(section.numberOfCorrectResponses, acc);
      }, 0);
      $log.debug("getMaxNumberOfCorrectResponses", result, scope.model.sections);
      return result;
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
      if(!scope.model || _.isEmpty(scope.model.sections)){
        return;
      }

      _.forEach(scope.model.sections, function(section){
        if(!section.partialScoring){
          section.partialScoring = [makeScenario(1, 25)];
        }
        section.numberOfCorrectResponses = Math.max(0, isNaN(section.numberOfCorrectResponses) ? 0 : section.numberOfCorrectResponses);
        section.maxNumberOfScoringScenarios = Math.max(1, section.numberOfCorrectResponses - 1);
        section.canAddScoringScenario = section.partialScoring.length < section.maxNumberOfScoringScenarios;
        section.canRemoveScoringScenario = section.partialScoring.length > 1;

        section.partialScoring = _.filter(section.partialScoring, function(ps) {
          return ps.numberOfCorrect <= 1 || ps.numberOfCorrect < section.numberOfCorrectResponses;
        });
      });
      $log.debug("updatePartialScoringModel", scope.model);
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
        '  <div class="panel panel-default" ng-class="{disabled: !isAllowedToConfigurePartialScoring()}">',
        '    <div class="panel-heading">',
        '      <h4 class="panel-title">',
        '        <a ng-click="togglePartialScoring()">',
        '          <span class="icon">',
        '            <i class="fa fa-{{allowPartialScoring ? \'minus\' : \'plus\'}}-circle"></i>',
        '          </span>',
        '          Partial Scoring Rules',
        '        </a>',
        '      </h4>',
        '    </div>',
        '    <div class="partial-scoring">',
        '      <div class="panel-body" collapse="!isAllowedToConfigurePartialScoring() || !allowPartialScoring">',
        '        <div class="section" ng-repeat="section in model.sections" ng-show="section.numberOfCorrectResponses > 1">',
        '          <div class="html-wrapper" ng-bind-html-unsafe="section.label"></div>',
        '          <ul class="list-unstyled">',
        '            <li class="scoring-item" ng-repeat="scenario in section.partialScoring">',
        '              If',
        '              <input class="form-control" type="number" min="1" max="{{section.maxNumberOfScoringScenarios}}" ng-model="scenario.numberOfCorrect"/>',
        '              of {{section.numberOfCorrectResponses}} possible correct answers is selected, award',
        '              <input class="form-control" type="number" min="1" max="99" ng-model="scenario.scorePercentage"/>',
        '              % of full credit.',
        '              <i class="fa fa-trash-o remove-item" ng-show="section.canRemoveScoringScenario" ng-click="removeScoringScenario(section, $index)"></i>',
        '            </li>',
        '          </ul>',
        '          <div class="text-right">',
        '            <button class="btn btn-default" ng-click="addScoringScenario(section)" ng-show="section.canAddScoringScenario">',
        '              <i class="fa fa-plus"/>',
        '              Add another scenario',
        '            </button>',
        '          </div>',
        '          <hr/>',
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
  }
}