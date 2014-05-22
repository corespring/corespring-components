var main = [

  function() {
    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function($scope, $element, $attrs) {

      },
      template: [
      ].join("")
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
