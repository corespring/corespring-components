var directive = [
  '$timeout', '$log', function ($timeout, $log) {

    return {
      restrict: 'EA',
      transclude: true,
      template: [
          "<div style='height: {{maxHeight}}px'>",
          "<a ng-click='goLeft()'>Left</a>",
          "<a ng-click='goRight()'>Right</a>",
          "<div class='transcluded-content' ng-transclude></div></div>",
        ].join(''),
      link: function (scope, element, attrs) {
        scope.currentPage = 0;
        scope.childElements = [];
        scope.maxHeight = 100;

        $(element).find('.transcluded-content').children().each(function(idx, e) {
          scope.childElements.push(e);
        });

        scope.goLeft = function() {
          scope.currentPage = (scope.currentPage > 0) ?  scope.currentPage - 1 : 0;
        };

        scope.goRight = function() {
          scope.currentPage = (scope.currentPage < scope.childElements.length - 1) ?  scope.currentPage + 1 : scope.childElements.length - 1;
        };

        scope.$watch('currentPage', function (v) {
          _.each(scope.childElements, function (e, idx) {
            if (idx != scope.currentPage) $(e).hide(); else $(e).show();
          });
        });

        $timeout(function() {
          _.each(scope.childElements, function(e) {
            var h = $(e).height() + 30;
            if (h > scope.maxHeight) scope.maxHeight = h;
          });
        }, 101);

      }
    };
  }
];

exports.framework = 'angular';
exports.directive = {
  name: "corespringCoverflow",
  directive: directive
};