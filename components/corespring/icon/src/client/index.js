var main = [function() {
  return {
    restrict: 'E',
    scope : {},
    template: [
      '<span class="{{key}}">',
      ' {{key}}',
      '</span>'
    ].join('\n'),
    link: function($scope, $element, $attrs) {
      var iconSet = 'emoji';
      $scope.feedback = $attrs.feedback;
      $scope.key = $attrs.key + ($scope.feedback ? '-feedback' : '');
      //$scope.template = 'images/' + [iconSet, $scope.key].join('-') + ($attrs.shape ? '-' + $attrs.shape : '') + '.svg';
    }
  }
}];

exports.framework = 'angular';
exports.directive = main;