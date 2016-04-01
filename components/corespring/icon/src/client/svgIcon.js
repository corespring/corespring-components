var svgIcon = [function() {
  return {
    restrict: 'E',
    scope: {
      'iconSet': '@',
      'shape': '@',
      'text': '@',
      'open': '@'
    },
    template: [
      '<span class="{{key}}" ng-click="toggle()" turo="{{template}}"> ',
      '  <span class="po">',
      '    <div style="width: 22px;" class="cs-icon">',
      '      <ng-include src="template"/>',
      '    </div>',
      '  </span>',
      '</span>'
    ].join('\n'),
    link: function($scope, $element, $attrs) {


      $scope.updateTemplate = function() {
        $scope.key = $attrs.key + ($scope.text ? '-feedback' : '');
        if (!$scope.iconSet || !$scope.key || !$scope.shape) {
          return undefined;
        }

        $scope.template = '../../../images/feedback/'
          + [$scope.iconSet, $scope.key].join('-')
          + ($scope.shape ? '-' + $scope.shape : '')
          + ($scope.open ? '-open' : '')
          + '.svg';

      };
      $attrs.$observe('key', $scope.updateTemplate);
      $scope.$watch('iconSet', $scope.updateTemplate);
      $scope.$watch('shape', $scope.updateTemplate);
      $scope.$watch('text', $scope.updateTemplate);
      $scope.$watch('open', $scope.updateTemplate);
    }
  }
}];

exports.framework = 'angular';
exports.directive = {
  name: 'svgIcon',
  directive: svgIcon
};