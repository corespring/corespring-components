var main = [

  //TODO Implement config panel
  //For now you have to configure it in v1

  function() {
    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {},
      template: [
      ].join("")
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
