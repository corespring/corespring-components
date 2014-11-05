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
        '  <div>Max Number of Points: <input type="text" ng-model="fullModel.model.config.maxNumberOfPoints"/></div>',
        '  <div>Tick Freq: <input type="text" ng-model="fullModel.model.config.tickFrequency"/></div>',
        '  <div>Snap per Tick: <input type="text" ng-model="fullModel.model.config.snapPerTick"/></div>',
        '  <table>',
        '    <tr>',
        '      <td style="vertical-align: top">Show student options for:</td>',
        '      <td>',
        '        <div><input type="checkbox" id="point" ng-model="fullModel.model.config.pointEnabled"/><label for="point">Point</label></div> ',
        '        <div><input type="checkbox" id="line" ng-model="fullModel.model.config.lineEnabled" /><label for="line">Line Segment</label></div> ',
        '        <div><input type="checkbox" id="ray" ng-model="fullModel.model.config.rayEnabled" /><label for="ray">Ray</label></div> ',
        '        <div><input type="checkbox" id="all" ng-model="fullModel.model.config.allEnabled" /><label for="all">All</label></div> ',
        '      </td>',
        '    </tr>',
        '  </table>',
        '  <div><input type="checkbox" id="group" ng-model="fullModel.model.config.groupingEnabled" /><label for="group">Group types</label></div>',
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
