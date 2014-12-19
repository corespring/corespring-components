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
        },
        scope: {
          "feedback": "=",
          "correctClass": "@"
        },
        replace: true,
        template: [
          '<div class="panel panel-default feedback {{correctClass}}" ng-if="feedback">',
          '  <div class="panel-heading">',
          '  </div>',
          '  <div>',
          '    <div class="panel-body" ng-bind-html-unsafe="feedback">',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')
      };
    }
  ]
};
