var choiceIcon = ['ASSETS_PATH', function(ASSETS_PATH) {
  return {
    restrict: 'E',
    scope: {
      'key': '@',
      'shape': '@'
    },
    template: [
      '<span class="{{key}}">',
      '  <span>',
      '    <div class="choice-icon">',
      '      <ng-include src="template"/>',
      '    </div>',
      '  </span>',
      '</span>'
    ].join('\n'),
    link: function($scope, $element, $attrs) {
      var pn = window.location.pathname;
      $scope.template = ASSETS_PATH + '/components-assets/choice/' + [$scope.shape, $scope.key].join('-') + '.svg';
      $scope.$watch('key+shape', function() {
        $scope.template = ASSETS_PATH + '/components-assets/choice/' + [$scope.shape, $scope.key].join('-') + '.svg';
      });
    }
  };
}];

exports.framework = 'angular';
exports.directive =
{
  name: 'choiceIcon',
  directive: choiceIcon
}
;