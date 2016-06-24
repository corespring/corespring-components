var def = function() {
  var defaults = {
    showMessage: 'Show correct answer',
    hideMessage: 'Show my answer'
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
      $scope.showMessageCalculated = $scope.showMessage ? $scope.showMessage : defaults.showMessage;
      $scope.hideMessageCalculated = $scope.hideMessage ? $scope.hideMessage : defaults.hideMessage;

    },
    template: [
      '<div class="button-row btn-group-md text-center {{class}}">',
      '  <div class="show-correct-answer" ng-class="{showCorrectVisible: visible}">',
      '    <div icon-toggle icon-name="correct" class="icon-toggle-correct" ng-model="toggle" closed-label="{{showMessageCalculated}}" open-label="{{hideMessageCalculated}}"></div>',
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
