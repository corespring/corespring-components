var choiceIcon = ['ASSETS_PATH', 'ASSETS_PATH_VERSION', '$sce', function(ASSETS_PATH, ASSETS_PATH_VERSION, $sce) {
  return {
    restrict: 'E',
    scope: {
      'key': '@',
      'shape': '@'
    },
    template: [
      '<span class="choice-icon ">',
      '  <ng-include src="template"/>',
      '</span>'
    ].join('\n'),
    link: function($scope, $element, $attrs) {
      function updateTemplate() {
        $scope.template = $sce.trustAsResourceUrl(ASSETS_PATH + '/components-assets/choice/' + [$scope.shape, $scope.key].join('-') + '.svg?version=' + ASSETS_PATH_VERSION);
      }
      updateTemplate();
      $scope.$watch('key+shape', function(n,p) {
        if (n === p) {
          return;
        }
        updateTemplate();
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