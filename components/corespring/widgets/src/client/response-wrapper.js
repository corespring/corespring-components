/* global exports */
var main = function($rootScope, $timeout) {
  return {
    link: function($scope, $element, $attrs) {
      var activeElement = 0;
      $element.addClass('response-wrapper');

      var delay = 250;

      function resizeContainer() {
        var elements = $element.children();
        $scope.setVisible(activeElement);

        var dimensions = _.map(elements, function(element) {
          var dimensions = element.getBoundingClientRect();
          return [dimensions.width, dimensions.height];
        });

        var width = $attrs.width === undefined ? (Math.ceil(_.chain(dimensions).map(function(dimension) {
            return dimension[0];
          }).max().value()) + 'px') : $attrs.width;

        var height = Math.ceil(_.chain(dimensions).map(function(dimension) {
            return dimension[1];
          }).max().value()) + 'px';

        $element.css({
          height: height,
          width: width
        });
      }

      $scope.setVisible = function(i) {
        var active = _.isNumber(i) ? $element.children().eq(i) : (_.isString(i) ? $(i, $element)[0] : undefined);
        $element.children().addClass('response-element');

        if (active) {
          activeElement = i;
          _.each($element.children(), function(child) {
            if (child !== active[0]) {
              $(child).removeClass('active-element');
            }
          });

          if (!($(active).hasClass('active-element'))) {
            $timeout(function() {
              $(active).addClass('active-element');
            }, delay);
          }
        }
      };

      $scope.$on('setVisible', function(event, i) {
        $scope.setVisible(i);
      });

      $rootScope.$watch(resizeContainer);
    },
    restrict: 'EA'
  };
};

exports.framework = 'angular';
exports.directive = {
  name: "responseWrapper",
  directive: main
};