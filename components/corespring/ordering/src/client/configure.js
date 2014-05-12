var main = [
  '$sce',
  'WiggiMathJaxFeatureDef',
  function($sce, WiggiMathJaxFeatureDef) {
    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function($scope, $element, $attrs) {

        $scope.extraFeatures = {
          definitions: [{
            type: 'group',
            buttons: [new WiggiMathJaxFeatureDef()]
          }]
        };

        $scope.containerBridge = {
          setModel: function(model) {
            $scope.fullModel = model;
            $scope.model = $scope.fullModel.model;
            $scope.deactivate();
          },
          getModel: function() {
            var model = _.cloneDeep($scope.fullModel);
            return model;
          }
        };

        $scope.deleteChoice = function(index) {
          $scope.model.choices.splice(index, 1);
        };

        $scope.activate = function($index) {
          $scope.active[$index] = true;

          $element.find('.wiggi-wiz-editable').each(function(i, el) {
            $scope.active[i] = $index === i;
            if ($index === i) {
              $(el).focus();
            }
          });
        };

        $scope.deactivate = function() {
          $scope.active = _.map($scope.model.choices, function() { return false; });
        };

        $scope.addChoice = function() {
          $scope.model.choices.push({content: "", label: ""});
        }

        $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);

        $scope.choiceMarkup = function(choice) {
          return $sce.trustAsHtml(choice.label);
        };
      },
      template: [
        '<div class="view-ordering-config" ng-click="deactivate()">',
        '  <p class="info">In Ordering, a student is asked to sequence events or inputs in a specific order.</p>',
        '  <p class="info">',
        '    Drag and drop your choices to set the correct order. The student view will display the choices in ',
        '    randomized order.',
        '  </p>',
        '  <input class="prompt" type="text" ng-model="model.prompt" placeholder="Enter a label or leave blank"/>',
        '  <ul ui-sortable="" ng-model="model.choices">',
        '    <li ng-repeat="choice in model.choices" ng-click="$event.stopPropagation()" ng-dblclick="activate($index)">',
        '      <div class="delete-icon" ng-show="active[$index]">',
        '        <i ng-click="deleteChoice($index)" class="fa fa-times-circle"></i>',
        '      </div>',
        '      <div class="blocker" ng-hide="active[$index]">',
        '        <div class="bg"></div>',
        '        <div class="content">',
        '          <div class="title">Double Click to Edit</div>',
        '        </div>',
        '      </div>',
        '      <div class="delete-icon">',
        '        <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
        '      </div>',
        '      <span ng-hide="active[$index]" ng-bind-html="choiceMarkup(choice)"></span>',
        '      <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz />',
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
