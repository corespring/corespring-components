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
            $scope.iconKey = $scope.correctClass === 'partial' ? 'partially-correct' :
              ($scope.correctClass.indexOf('answer-expected') >= 0 ? 'nothing-submitted' : $scope.correctClass.trim());
            $scope.iconShape = ($scope.iconKey !== 'nothing-submitted' ? 'square' : '');
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
          '    <div class="panel-body">',
          '      <svg-icon key="{{iconKey}}" shape="{{iconShape}}" icon-set="emoji"></svg-icon>',
          '      <div ng-bind-html-unsafe="feedback">',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')
      };
    }
  ]
};
