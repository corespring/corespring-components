var svgIcon = ['ASSETS_PATH', function(ASSETS_PATH) {
  return {
    restrict: 'E',
    scope: {
      'iconSet': '@',
      'shape': '@',
      'open': '@'
    },
    template: [
      '<span class="{{key}}" ng-if="template"> ',
      '  <div class="cs-icon">',
      '    <ng-include src="template"/>',
      '  </div>',
      '</span>'
    ].join('\n'),
    link: function($scope, $element, $attrs) {

      $scope.updateTemplate = function() {
        $scope.feedback = $attrs.feedback;
        $scope.key = $attrs.key + ($attrs.category === 'feedback' ? '-feedback' : '');
        if (_.isEmpty($attrs.key)) {
          $scope.template = undefined;
          return;
        }

        var category = $attrs.category || 'feedback';

        if ($scope.key === 'empty') {
          $scope.template = ASSETS_PATH + '/components-assets/' + category + '/empty.svg';
        } else {
          $scope.template = [ASSETS_PATH + '/components-assets/' + category + '/',
            ($scope.iconSet ? $scope.iconSet + '-' : ''),
            $scope.key,
            ($scope.shape ? '-' + $scope.shape : ''),
            ($scope.open === 'true' ? '-open' : ''),
            '.svg'].join('');
          console.log('$scope.template', $scope.template);
        }

      };

      $attrs.$observe('key', $scope.updateTemplate);
      $scope.$watch('iconSet', $scope.updateTemplate);
      $scope.$watch('shape', $scope.updateTemplate);
      $scope.$watch('open', $scope.updateTemplate);
    }
  };
}];

exports.framework = 'angular';
exports.directive = {
  name: 'svgIcon',
  directive: svgIcon
};