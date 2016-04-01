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
      $scope.template = '../../../images/choice/' + [$scope.shape, $scope.key].join('-') + '.svg';
      console.log('$scope.template', $scope.template);
      $scope.$watch('key+shape', function() {
        $scope.template = '../../../images/choice/' + [$scope.shape, $scope.key].join('-') + '.svg';
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