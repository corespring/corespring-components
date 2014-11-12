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

        // Temporary way to test the interaction
        scope.$watch('fullModel', function(n) {
          if (n) {
            scope.modelJson = JSON.stringify(n, null, 2);
          }
        }, true);

        scope.$watch("modelJson", _.debounce(function (json) {
          if (!_.isUndefined(json)) {
            scope.$apply(function() {
              var newModel = JSON.parse(json);
              _.merge(scope.fullModel, newModel);
              scope.fullModel.correctResponse = newModel.correctResponse;
              scope.fullModel.model.objects = newModel.model.objects;
            });
          }
        }, 200));

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      },
      template: [
        '<div class="config-number-line">',
        '  <div>Domain: <input type="number" ng-model="fullModel.model.config.domain[0]"/><input type="number" ng-model="fullModel.model.config.domain[1]"/></div>',
        '  <div>Max Number of Points: <input type="number" ng-model="fullModel.model.config.maxNumberOfPoints"/></div>',
        '  <div>Tick Freq: <input type="number" ng-model="fullModel.model.config.tickFrequency"/></div>',
        '  <div>Snap per Tick: <input type="number" ng-model="fullModel.model.config.snapPerTick"/></div>',
        '  <div><input type="checkbox" id="group" ng-model="fullModel.model.config.groupingEnabled" /><label for="group">Group types</label></div>',
        '  <textarea cols="100" rows="50" ng-model="modelJson"></textarea>',
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
