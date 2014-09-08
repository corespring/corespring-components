exports.framework = "angular";
exports.directive = {
  name: "checkbox",
  directive: [
    '$compile',
    function($compile) {

      return {
        replace: true,
        restrict: 'E',
        scope: {
          model: '@'
        },
        link: function($scope, $element) {
          $scope.toggle = function() {
            $scope.model = ($scope.model === true ? false : true);
          };
          console.log($element.find('.checkbox-toggle'));
        },
        template: [
          '<div class="checkbox-input">',
          '  <div class="checkbox-toggle" ng-click="toggle()" ng-class="{\'checked\': model}"/>',
          '</div>'
        ].join('')
      };
    }
  ]
};