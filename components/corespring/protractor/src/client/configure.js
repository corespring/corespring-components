var main = [
  '$log',
  function($log) {
    return {
      scope: {},
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {}
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
