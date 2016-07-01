/* global exports */
var main = function() {
  return {
    link: function($scope, $element) {
      var activeElement = 0;
      $element.addClass('response-wrapper');

      function resizeContainer() {
        var elements = $element.children();
        $scope.setVisible(activeElement);

        var dimensions = _.map(elements, function(element) {
          var dimensions = element.getBoundingClientRect();
          return [dimensions.width, dimensions.height];
        });

        var width = Math.ceil(_.chain(dimensions).map(function(dimension) {
            return dimension[0];
          }).max().value()) + 'px';

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
        console.log(active);
        $element.children().addClass('response-element');

        if (active) {
          activeElement = i;
          _.each($element.children(), function(child) {
            if (child !== active) {
              $(child).removeClass('active-element');
            }
          });
          $(active).addClass('active-element');
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
exports.directives = [{
  name: "responseWrapper",
  directive: main
}];