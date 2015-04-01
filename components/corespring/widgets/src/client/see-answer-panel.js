var def = function() {
  return {
    restrict: "AE",
    transclude: true,
    replace: true,
    scope: {
      answerExpanded: '=?seeAnswerPanelExpanded'
    },
    link: function(scope, element, attrs) {
      scope.$watch('answerExpanded', function(n, p) {
        if (_.isUndefined(scope.defaultState)) {
          scope.defaultState = scope.answerExpanded ? 'answerExpanded' : '';
        }

        if (_.isUndefined(n) || n === p) {
          return;
        }

        if (n) {
          $(element).find('.answer-collapse').css('height', 'auto');
          $(element).find('.answer-collapse').css('display', 'none');
          $(element).find('.answer-collapse').addClass('answerExpanded');
          $(element).find('.answer-collapse').slideDown(400);
        } else {
          $(element).find('.answer-collapse').slideUp(400, 'swing', function() {
            $(element).find('.answer-collapse').attr('style','');
            $(element).find('.answer-collapse').removeClass('answerExpanded');
          });
        }
      });
    },
    template: [
      '  <div class="see-answer-panel answer-holder">',
      '    <div class="panel panel-default">',
      '      <div class="panel-heading" ng-click="answerExpanded = !answerExpanded">',
      '        <h4 class="panel-title" ><i class="answerIcon fa fa-eye{{answerExpanded ? \'-slash\' : \'\'}}"></i>{{answerExpanded ? \'Hide Answer\' : \'Show Correct Answer\'}}</h4>',
      '      </div>',
      '      <div class="answer-collapse {{defaultState}}">',
      '        <div class="panel-body" ng-transclude>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>'
    ].join('')
  };
};


exports.framework = "angular";
exports.directive = {
  name: "seeAnswerPanel",
  directive: def
};
