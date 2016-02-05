/* global exports */

var main = [
  function() {

    "use strict";
    return {
      scope: {},
      restrict: 'E',
      replace: true,
      link: function($scope, $element, $attrs) {

        $scope.containerBridge = {
          setModel: function(fullModel) {
            scope.fullModel = fullModel;
          }
        };

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

        $scope.init = function() {
          $scope.active = [];
          $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
        };

        $scope.init();
      },
      template: [
        '<div class="passage-config">',
        'config!',
        '</div>'
      ].join('\n')
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];

