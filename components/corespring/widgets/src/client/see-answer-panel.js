var def = function() {
  return {
    restrict: "AE",
    transclude: true,
    replace: true,
    scope: {},
    link: function(scope, element, attrs) {
      scope.answerVisible = false;
      scope.$watch('answerVisible', function(n, p) {
        if (_.isUndefined(n) || n === p) {
          return;
        }
        if (n) {
          $(element).find('.answer-collapse').css('height', 'auto');
          $(element).find('.answer-collapse').css('display', 'none');
          $(element).find('.answer-collapse').addClass('answerVisible');
          $(element).find('.answer-collapse').slideDown(400);
        } else {
          $(element).find('.answer-collapse').slideUp(400, 'swing', function() {
            $(element).find('.answer-collapse').attr('style','');
            $(element).find('.answer-collapse').removeClass('answerVisible');
          });
        }
      });
    },
    template: [
      '  <div class="see-answer-panel answer-holder">',
      '    <div class="panel panel-default">',
      '      <div class="panel-heading" ng-click="answerVisible = !answerVisible">',
      '        <h4 class="panel-title" ><i class="answerIcon fa fa-eye{{answerVisible ? \'-slash\' : \'\'}}"></i>{{answerVisible ? \'Hide Answer\' : \'Show Correct Answer\'}}</h4>',
      '      </div>',
      '      <div class="answer-collapse">',
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
