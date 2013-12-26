var directive = [
  '$timeout', '$log', function ($timeout, $log) {

    var linkFn = function(scope, elm, attrs, container) {
      scope.folded = true;
    };

    return {
      restrict: 'A',
      transclude: true,
      link: linkFn,
      scope: {},
      template: [
        "<div class='view-foldable'>",
        "<span class='toggle-icon' ng-click='folded = !folded'><img src='/assets/images/component.png'></img></span>",
        "<div ng-hide='folded' ng-transclude></div>",
        "</div>"
      ].join("")
    };
  }
];

exports.framework = 'angular';
exports.directive = {
  name: "corespringFoldable",
  directive: directive
};