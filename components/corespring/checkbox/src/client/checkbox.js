exports.framework = "angular";
exports.directive = {
  name: "checkbox",
  directive: [
    '$compile',
    function($compile) {

      var link = function($scope, $element, $attr) {
        $scope.toggle = function() {
          $scope.model = ($scope.model === true ? false : true);
        };
        $attr.$observe('checked', function(checked) {
          $scope.model = (checked === true);
        });
      };

      return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
          model: '=?'
        },
        compile: function($scope, $element, $trans) {
          return link;
        },
        template: [
          '<div class="checkbox-input" ng-click="toggle()">',
          '  <div class="checkbox-toggle" ng-class="{\'checked\': model}"/><span class="label-text" ng-transclude/>',
          '</div>'
        ].join('')
      };
    }
  ]
};