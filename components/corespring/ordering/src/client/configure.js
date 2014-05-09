var main = [
  function() {
    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function($scope, $element, $attrs) {

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

        $scope.deleteChoice = function(index) {
          $scope.model.choices.splice(index, 1);
        };

        $scope.addChoice = function() {
          $scope.model.choices.push({content: "", label: ""});
        }

        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
      },
      template: [
        '<div class="view-ordering-config">',
        '  <p class="info">In Ordering, a student is asked to sequence events or inputs in a specific order.</p>',
        '  <p class="info">',
        '    Drag and drop your choices to set the correct order. The student view will display the choices in ',
        '    randomized order.',
        '  </p>',
        '  <input class="prompt" type="text" ng-model="model.prompt" placeholder="Enter a label or leave blank"/>',
        '  <ul ui-sortable="" ng-model="model.choices">',
        '    <li ng-repeat="choice in model.choices" ng-mouseenter="active = true" ng-mouseleave="active = false">',
        '      <div class="delete-icon" ng-show="active">',
        '        <i ng-click="deleteChoice($index)" class="fa fa-times-circle"></i>',
        '      </div>',
        '      <span ng-hide="active">{{choice.label}}</span>',
        '      <input type="text" ng-show="active" ng-model="choice.label" />',
        '    </li>',
        '  </ul>',
        '  <button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>',
        '</div>'
      ].join('\n')
    };
  }
];


exports.framework = 'angular';
exports.directives = [{
    directive: main
}];
