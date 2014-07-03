var main = [

  function() {

    var inputHolder = function(header, body) {
      return [
        '  <div class="input-holder">',
        '    <div class="header">' + header + '</div>',
        '    <div class="body">',
               body,
        '    </div>',
        '  </div>'
      ].join("");
    };

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function($scope, element, attrs) {

        $scope.containerBridge = {
          setModel: function(model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;
          },

          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          }

        };
//        $scope.registerConfigPanel(attrs.id, $scope.containerBridge);

      },
      template: [
        '<div>',
        '  <div class="config-panel">',
        inputHolder('Question Prompt', '<textarea ck-editor rows=\"2\" cols=\"60\" ng-model=\"model.prompt\"></textarea>'),
        '  </div>',
        '</div>'
      ].join("")
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
