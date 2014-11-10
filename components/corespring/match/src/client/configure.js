var main = [
  '$log',
  '$timeout',
  '$http',
  'ChoiceTemplates',
  function(
    $log,
    $timeout,
    $http,
    ChoiceTemplates
    ) {

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {

        var matchModel = {};

        scope.containerBridge = {
          setModel: function(model) {
            matchModel = model;
          },

          getModel: function() {
            return matchModel;
          }
        };

      },

      template: [
        '<h1>Configuration for the match interaction is not yet implemented</h1>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
