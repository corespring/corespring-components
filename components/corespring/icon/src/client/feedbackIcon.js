var feedbackIcon = [function() {
  return {
    restrict: 'E',
    scope: {
      'iconSet': '@',
      'shape': '@'
    },
    template: [
      '<span class="{{key}}" ng-click="toggle()" turo="{{template}}">',
      '  <span popover="{{text}}" popover-position="top" popover-trigger="{{text ? \'mouseover\' : \'\'}}">',
      '    <div style="width: 30px;" class="cs-icon">',
      '      <ng-include src="template"/>',
      '    </div>',
      '  </span>',
      '</span>'
    ].join('\n'),
    link: function($scope, $element, $attrs) {

      console.log('$scope.template', $scope.template);

      $scope.updateTemplate = function() {
        $scope.text = $attrs.text;
        $scope.key = $attrs.key + ($scope.text ? '-feedback' : '');

        $scope.template = '../../../images/feedback/'
          + [$scope.iconSet, $scope.key].join('-')
          + ($scope.shape ? '-' + $scope.shape : '')
          + ($scope.open ? '-open' : '')
          + '.svg';

        console.log("tempi", $scope.template);
      };

      $scope.toggle = function() {
        if ($scope.text) {
          $scope.open = !$scope.open;
        }
        $scope.updateTemplate();
      };

      $scope.updateTemplate();
    }
  }
}];

exports.framework = 'angular';
exports.directive = {
  name: 'feedbackIcon',
  directive: feedbackIcon
};