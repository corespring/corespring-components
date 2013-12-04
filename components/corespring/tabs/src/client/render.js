var main = [
  '$log',
  function ($log) {

    var link = function (scope, element, attrs) {

      $log.debug("tabs: !!");

    };

    return {
      scope: {},
      restrict: 'A',
      replace: true,
      link: link,
      template: '<div>tabs</div>'
    };
  }
];

exports.framework = 'angular';
exports.directive = main;

