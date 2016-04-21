var iconToggle = [
  function() {
    return {
      scope: {
        ngModel: "=",
        iconName: "@",
        label: "@",
        closedLabel: "@",
        openLabel: "@"
      },
      transclude: true,
      template: [
        '<div>',
        '  <a ng-click="toggleCorrect()" class="icon-toggle">',
        '    <div class="icon-holder">',
        '      <div class="icon-inner-holder">',
        '        <svg-icon class="toggle-icon show-state" ng-if="!ngModel" category="showHide" key="show-{{iconName}}"></svg-icon>',
        '        <svg-icon class="toggle-icon hide-state" ng-if="ngModel" category="showHide" key="hide-{{iconName}}"></svg-icon>',
        '      </div>',
        '    </div>',
        '    <span class="toggle-label" ng-bind-html-unsafe="currentLabel"></span>',
        '  </a>',
        '  <div ng-show="ngModel" ng-transclude></div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {

        $scope.ngModel = _.isUndefined($scope.ngModel) ? false : $scope.ngModel;
        $scope.currentLabel = $scope.ngModel ? ($scope.openLabel || $scope.label) : ($scope.closedLabel || $scope.label);

        $scope.$watch('ngModel', function() {
          $scope.currentLabel = $scope.ngModel ? ($scope.openLabel || $scope.label) : ($scope.closedLabel || $scope.label);
        });

        $scope.toggleCorrect = function() {
          $scope.ngModel = !$scope.ngModel;
        };

      }
    }
  }
];

exports.framework = "angular";
exports.directive = {
  name: 'iconToggle',
  directive: iconToggle
};
