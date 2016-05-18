var def = function() {
  return {
    restrict: "AE",
    replace: true,
    scope: {
      'visible': '=',
      'toggle' : '='
    },
    link: function($scope) {
      $scope.changeToggle = function() {
        $scope.toggle = !$scope.toggle;
      };
    },
    template: [
      '<div class="button-row btn-group-md text-center {{class}}">',
      '  <div class="show-correct" ng-if="visible" ng-click="changeToggle()">',
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
