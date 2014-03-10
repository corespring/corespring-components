var main = [

  function() {
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
            console.log("GETRTING", scope.fullModel.correctResponse);
            return scope.fullModel;
          }
        };

        scope.registerConfigPanel(attrs.id, scope.containerBridge);

      },
      template: [
        '<div class="input-holder">',
        '  <div class="header">Correct Response</div>',
        '  <div class="body">',
        '     <input class="form-control text-input" type="text"  ng-repeat="cr in fullModel.correctResponse track by $index" ng-model="$parent.fullModel.correctResponse[$index]" />',
        '  </div>',
        '</div>'].join('\n')
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
