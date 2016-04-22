exports.framework = "angular";
exports.directive = {
  name: "feedback",
  directive: [
    '$log',
    function($log) {

      return {
        link: function($scope, $element, $attrs) {
          $scope.isOpen = false;
          $scope.toggle = function() {
            $scope.isOpen = !$scope.isOpen;
          };
          $scope.$watch('correctClass', function() {
            $scope.iconKey = $scope.correctClass == 'partial' ? 'partially-correct' : $scope.correctClass;
          });
        },
        scope: {
          "feedback": "=",
          "iconset": "=",
          "correctClass": "@"
        },
        replace: true,
        template: [
          '<div class="panel panel-default feedback {{correctClass}}" ng-if="feedback">',
          '  <div>',
          '    <svg-icon key="{{iconKey}}" shape="square" icon-set="emoji"></svg-icon>',
          '    <div class="panel-body" ng-bind-html-unsafe="feedback">',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')
      };
    }
  ]
};
