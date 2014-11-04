var main = [
  '$log',
  function($log) {


    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {

        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
          },

          getModel: function() {
            return scope.fullModel;
          }
        };
        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      },
      template: [
        '<div class="config-number-line">',
        '  <div>Domain: <input type="text" ng-model="fullModel.model.config.domain[0]"/><input type="text" ng-model="fullModel.model.config.domain[1]"/></div>',
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
