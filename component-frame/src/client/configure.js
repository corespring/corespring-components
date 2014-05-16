var main = [
  function () {
    return { 
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function ($scope, $element, $attrs) {
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
      },
      template: [
      ].join("")
    };
  }
];

exports.framework = 'angular';
exports.directives = [{directive: main}];

