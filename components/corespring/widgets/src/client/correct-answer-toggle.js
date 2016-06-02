var def = function() {
  var defaults = {
    showMessage: 'Show Correct Answer',
    hideMessage: 'Show My Answer'
  };

  return {
    restrict: "AE",
    replace: true,
    scope: {
      'visible': '=',
      'toggle' : '=',
      'showMessage': '@',
      'hideMessage': '@'
    },
    link: function($scope) {
      var showMessage = $scope.showMessage ? $scope.showMessage : defaults.showMessage;
      var hideMessage = $scope.hideMessage ? $scope.hideMessage : defaults.hideMessage;

      $scope.changeToggle = function() {
        $scope.toggle = !$scope.toggle;
        $scope.message = ($scope.toggle ? hideMessage : showMessage);
      };

      $scope.message = showMessage;
    },
    template: [
      '<div class="button-row btn-group-md text-center {{class}}">',
      '  <div class="show-correct" ng-if="visible" ng-click="changeToggle()">',
      '    <svg-icon category="showHide" key="correct-response" open="{{toggle}}"></svg-icon>',
      '    <span>{{message}}</span>',
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
