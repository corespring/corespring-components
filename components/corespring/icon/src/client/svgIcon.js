var svgIcon = ['ASSETS_PATH', 'ASSETS_PATH_VERSION', '$sce', function(ASSETS_PATH, ASSETS_PATH_VERSION, $sce) {
  return {
    restrict: 'E',
    scope: {
      'iconSet': '@',
      'shape': '@',
      'open': '@'
    },
    template: [
      '<span class="{{key}}" ng-if="template"> ',
      '  <div class="cs-icon {{hasFeedback() ? \'clickable\' : \'\'}}">',
      '    <ng-include src="template"/>',
      '  </div>',
      '</span>'
    ].join('\n'),
    link: function($scope, $element, $attrs) {

      $scope.hasFeedback = function() {
        return $attrs.category === 'feedback';
      };

      $scope.updateTemplate = function() {
        $scope.feedback = $attrs.feedback;
        $scope.key = $attrs.key + ($scope.hasFeedback() ? '-feedback' : '');
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
        }
        $scope.template = $sce.trustAsResourceUrl($scope.template + "?version=" + ASSETS_PATH_VERSION);
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