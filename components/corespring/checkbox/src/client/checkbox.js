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
        link: function($scope, $element, $attr) {
          $scope.toggle = function() {
            $scope.model = ($scope.model === true ? false : true);
          };
          $attr.$observe('checked', function(checked) {
            $scope.model = (checked === true);
          });
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