var def = function() {
  return {
    restrict: "AE",
    replace: true,
    scope: {
      'visible': '=',
      'toggle' : '='
    },
    link: function(scope, element, attrs) {
    },
    template: [
      '<div class="button-row btn-group-md text-center">',
      '  <div class="show-correct" ng-show="visible" ng-click="toggle = !toggle">',
      '    <svg-icon category="showHide" key="correct-response" open="{{toggle}}"></svg-icon>',
      '    <span>{{toggle ? \'Hide\' : \'Show\'}} Correct Answer</span>',
      '  </div>',
      '</div>'
    ].join('')
  };
};


exports.framework = "angular";
exports.directive = {
  name: "correctAnswerToggle",
  directive: def
};
