var choiceIcon = [function() {
  return {
    restrict: 'E',
    scope: {
      'key': '@',
      'shape': '@'
    },
    template: [
      '<span class="{{key}}">',
      '  <span popover="{{text}}" popover-position="top" popover-trigger="{{text ? \'mouseover\' : \'\'}}">',
      '    <div style="width: 30px;" class="choice-icon">',
      '      <ng-include src="template"/>',
      '    </div>',
      '  </span>',
      '</span>'
    ].join('\n'),
    link: function($scope, $element, $attrs) {
      $scope.template = '/client/images/components-assets/choice/' + [$scope.shape, $scope.key].join('-') + '.svg';
      $scope.$watch('key+shape', function() {
        $scope.template = '/client/images/components-assets/choice/' + [$scope.shape, $scope.key].join('-') + '.svg';
      });
    }
  }
}];

exports.framework = 'angular';
exports.directive =
{
  name: 'choiceIcon',
  directive: choiceIcon
}
;