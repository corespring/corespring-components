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

          function update() {
            $scope.iconKey = $scope.correctClass.trim() === 'partial' ? 'partially-correct' :
              (($scope.correctClass.indexOf('answer-expected') >= 0 || $scope.correctClass.indexOf('warning') >= 0) ? 'nothing-submitted' : $scope.correctClass.trim());
            $scope.iconShape = ($scope.iconKey !== 'nothing-submitted' ? 'square' : '');
            $scope.iconSet =  _.isEmpty($scope.iconSet) ? 'emoji' : $scope.iconSet;
          }

          $scope.$watch('correctClass', update);
          update();
        },
        scope: {
          "feedback": "=",
          "iconSet": "@",
          "correctClass": "@"
        },
        replace: true,
        template: [
          '<div class="panel panel-default feedback {{correctClass}}" ng-if="feedback">',
          '  <div>',
          '    <div class="panel-body">',
          '      <svg-icon key="{{iconKey}}" shape="{{iconShape}}" icon-set="{{iconSet}}"></svg-icon>',
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
