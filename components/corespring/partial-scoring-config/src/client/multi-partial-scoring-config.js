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
    scope.isPanelCollapsed = isPanelCollapsed;
    scope.removeScoringScenario = removeScoringScenario;
    scope.toggleAllowPartialScoring = toggleAllowPartialScoring;
    scope.updatePartialScoringModel = updatePartialScoringModel;

    scope.$watch('model', function(newValue, oldValue) {
      scope.updatePartialScoringModel();
    }, true);

    //--------------------------------------------------------------

    function isPanelCollapsed(){
      var collapsed = !(scope.allowPartialScoring && hasPartialScoringToConfigure());
      if(collapsed && isPartialScoringHidden()){
        fixPanelCollapsed();
      }
      return collapsed;

      //-----------------------

      function isPartialScoringHidden(){
       return elem.parents('.ng-hide').length > 0;
      }

      function fixPanelCollapsed(){
        elem.find('.panel-body').removeClass('collapsing');
        elem.find('.panel-body').addClass('collapse');
      }
    }

    function toggleAllowPartialScoring() {
      if (hasPartialScoringToConfigure()) {
        scope.allowPartialScoring = !scope.allowPartialScoring;
      }
    }

    function hasPartialScoringToConfigure(){
      return getMaxNumberOfCorrectResponses() > 1;
    }

    function getMaxNumberOfCorrectResponses(){
      var sections = scope.model && scope.model.sections || [];
      var result = _.reduce(sections, function(acc,section){
        return Math.max(section.numberOfCorrectResponses, acc);
      }, 0);
      return result;
    }

    function addScoringScenario(section) {
      var maxNumberOfCorrect = findMaxNumberOfCorrectInScoringScenarios(section);
      section.partialScoring.push(makeScenario(maxNumberOfCorrect + 1, 0));

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

      if(!hasPartialScoringToConfigure()) {
        scope.allowPartialScoring = false;
      }

      _.forEach(scope.model.sections, function(section){
        if(!section.partialScoring){
          section.partialScoring = [];
        }
        if(section.partialScoring.length === 0){
          section.partialScoring.push(makeScenario(1, 0));
        }
        section.numberOfCorrectResponses = Math.max(0, isNaN(section.numberOfCorrectResponses) ? 0 : section.numberOfCorrectResponses);
        section.maxNumberOfScoringScenarios = Math.max(1, section.numberOfCorrectResponses - 1);
        section.canAddScoringScenario = section.partialScoring.length < section.maxNumberOfScoringScenarios;
        section.canRemoveScoringScenario = section.partialScoring.length > 1;

        section.partialScoring = _.filter(section.partialScoring, function(ps) {
          return ps.numberOfCorrect <= 1 || ps.numberOfCorrect < section.numberOfCorrectResponses;
        });
      });
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
        '  <div class="panel panel-default">',
        '    <div class="panel-heading">',
        '      <h4 class="panel-title">',
        '        <a ng-click="toggleAllowPartialScoring()">',
        '          <span class="icon">',
        '            <i class="fa fa-{{isPanelCollapsed() ? \'plus\' : \'minus\'}}-circle"></i>',
        '          </span>',
        '          Partial Scoring Rules',
        '        </a>',
        '      </h4>',
        '    </div>',
        '    <div class="partial-scoring">',
        '      <div class="panel-body" collapse="isPanelCollapsed()">',
        '        <div class="section" ng-repeat="section in model.sections" ng-show="section.numberOfCorrectResponses > 1">',
        '          <div class="html-wrapper" ng-bind-html-unsafe="section.label"></div>',
        '          <ul class="list-unstyled">',
        '            <li class="scoring-item" ng-repeat="scenario in section.partialScoring">',
        '              If',
        '              <input class="form-control" type="number" min="1" max="{{section.maxNumberOfScoringScenarios}}" ng-model="scenario.numberOfCorrect"/>',
        '              of correct answers is selected, award',
        '              <input class="form-control" type="number" min="0" max="99" ng-model="scenario.scorePercentage"/>',
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