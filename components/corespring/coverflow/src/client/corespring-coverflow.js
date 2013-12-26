var directive = [
  '$timeout', '$log', function ($timeout, $log) {

    return {
      restrict: 'EA',
      transclude: true,
      template: [
          "<div class='view-coverflow' style='height: {{maxHeight}}px'>",
          "<div class='coverflow-control-bar'>Question {{currentPage+1}} / {{numberOfQuestions}}",
          "<span class='pull-right'>",
          "<button ng-disabled='currentPage < 1' class='btn btn-primary' ng-click='goLeft()' > Previous </button>",
          "<button ng-disabled='currentPage == numberOfQuestions-1' class='btn btn-primary' ng-click='goRight()' >Next</button>",
          "</span>",
          "</div>",
          "<div class='transcluded-content' ng-transclude></div>",
          "</div>"
        ].join(''),
      link: function (scope, element, attrs) {
        scope.currentPage = 0;
        scope.childElements = [];
        scope.maxHeight = 100;

        $(element).find('.transcluded-content').children().each(function(idx, e) {
          scope.childElements.push(e);
        });

        scope.numberOfQuestions = scope.childElements.length;

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

        setInterval(function() {
          _.each(scope.childElements, function(e) {
            var h = $(e).height() + 30;
            if (h > scope.maxHeight) scope.maxHeight = h;
          });
          scope.$apply();
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