var def = function() {
  var defaults = {
    showMessage: 'Show Instructions',
    hideMessage: 'Hide Instructions'
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
      '<div class="button-row btn-group-md {{class}}">',
      '  <div class="show-instructions" ng-class="{showCorrectVisible: visible}">',
      '    <div icon-toggle icon-name="instructions" class="icon-toggle-correct" ng-model="toggle" closed-label="{{showMessageCalculated}}" open-label="{{hideMessageCalculated}}"></div>',
      '  </div>',
      '</div>'
    ].join('')
  };
};


exports.framework = "angular";
exports.directive = {
  name: "instructionsToggle",
  directive: def
};
