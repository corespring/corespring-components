var main = [
    '$timeout',
    function($timeout) {

      function designTemplate() {
        return [
          '<p class="intro">',
          '  In Placement Ordering, a student is asked to sequence events or inputs in a specific order by dragging',
          '  the answers to a placement area.',
          '</p>',
          '<table class="choice-columns"><tr>',
          '  <td>',
          '    <input class="prompt" type="text" ng-model="model.config.choiceAreaLabel"',
          '      placeholder="Enter a label or leave blank"/>',
          '    <ul class="sortable-choices draggable-choices" ui-sortable="choicesSortableOptions" ng-model="choicesProxy">',
          '      <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in choicesProxy" ng-model="choicesProxy[$index]" ng-click="itemClick($event)" jqyoui-draggable="{index: {{$index}}, placeholder: \'keep\'}" data-jqyoui-options="{revert: \'invalid\'}"',
          '        ng-dblclick="activate($index)">',
          '        <div class="blocker" ng-hide="active[$index]">',
          '          <div class="bg"></div>',
          '          <div class="content">',
          '            <img class="drag-icon" src="../../images/hand-grab-icon.png"/>',
          '            <div class="title">Double Click to Edit</div>',
          '          </div>',
          '        </div>',
          '        <div class="delete-icon">',
          '          <i ng-click="deleteChoice($index)" class="fa fa-times-circle"></i>',
          '        </div>',
          '        <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
          '        <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz features="extraFeatures"',
          '          parent-selector=".editor-container"',
          '          placeholder="Enter choice and/or add an image or math code."',
          '          image-service="imageService" />',
          '      </li>',
          '    </ul>',
          '    <button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>',
          '  </td>',
          '  <td>',
          '    <input class="prompt" type="text" ng-model="model.config.answerAreaLabel"',
          '      placeholder="Enter a label or leave blank" />',
          '    <div class="draggable-choices-container">',
          '      <ul class="sorted-choices draggable-choices" ui-sortable="targetSortableOptions" ng-model="targets" data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
          '        <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in targets">',
          '          <div class="delete-icon">',
          '            <i ng-click="deleteTarget(choice)" class="fa fa-times-circle"></i>',
          '          </div>',
          '          <span ng-bind-html-unsafe="choice.label"></span>',
          '        </li>',
          '      </ul>',
          '     <div class="zero-state" ng-show="targets.length == 0">',
          '       Drag and order correct answers here.',
          '     </div>',
          '   </div>',
          '  </td>',
          '</tr></table>',
          '<label>',
          '  <input type="checkbox" ng-model="model.config.shuffle" />',
          '  Shuffle tiles',
          '</label>'
        ].join('\n');
      }

      return {
        scope: 'isolate',
        restrict: 'E',
        replace: true,
        link: function($scope, $element, $attrs) {

          $scope.targetDragging = false;

          function initTargets() {
            $scope.targets = _.map($scope.fullModel.correctResponse, function(id) {
              return _.find($scope.choicesProxy, function(choice) {
                return choice.id === id;
              });
            });
          }

          $scope.containerBridge = {
            setModel: function(model) {
              $scope.fullModel = model;
              $scope.model = $scope.fullModel.model;
              $scope.choicesProxy = $scope.model.choices;
              initTargets();
            },
            getModel: function() {
              var model = _.cloneDeep($scope.fullModel);
              return model;
            }
          };

          $scope.droppableOptions = {
            accept: function(a, b) {
              var contains = _($scope.targets).pluck('id').contains($scope.draggging);
              return !$scope.targetDragging && !contains;
            }
          };


          $scope.choicesSortableOptions = {
            disabled: false,
            start: function(event, ui) {
              var li = ui.item;
              $scope.draggging = li.data('choice-id');
            },
            stop: function() {
            }
          };

          $scope.targetSortableOptions = {
            start: function() {
              $scope.targetDragging = true;
            },
            stop: function() {
              $scope.targetDragging = false;
            }
          };

          $scope.activate = function($index) {
            $scope.active[$index] = true;
            $scope.choicesSortableOptions.disabled = true;
          };

          $scope.itemClick = function($event) {
            function isField($event) {
              return $($event.target).parents('.mini-wiggi-wiz').length !== 0;
            }

            $event.stopPropagation();
            $event.preventDefault();
            if (!isField($event)) {
              $scope.deactivate();
            }
          };

          $scope.deactivate = function() {
            $scope.active = _.map($scope.model.choices, function() {
              return false;
            });
            $scope.choicesProxy = _.map($scope.choicesProxy, function(choice) {
              choice.id = _.isEmpty(choice.id) ? choice.label.toLowerCase().replace(/ /g, '-') : choice.id;
              return choice;
            });
            $scope.choicesSortableOptions.disabled = false;
            $scope.model.choices = _.cloneDeep($scope.choicesProxy);
            $scope.$emit('mathJaxUpdateRequest');
          };

          $scope.addChoice = function() {
            $scope.choicesProxy.push({content: "", label: "", id: 'id_' + ($scope.choicesProxy.length + 1)});
            $scope.model.choices = _.cloneDeep($scope.choicesProxy);
          };

          $scope.deleteChoice = function(index) {
            var choice = $scope.choicesProxy.splice(index, 1);
            var deletedChoiceId = choice[0].id;
            $scope.fullModel.correctResponse = _.filter($scope.fullModel.correctResponse, function(responseId) {
              return responseId !== deletedChoiceId;
            });
            initTargets();
          };

          $scope.deleteTarget = function(choice) {
            $scope.targets = _.filter($scope.targets, function(c) {
              return c !== choice;
            });
          };

          $scope.init = function() {
            $scope.active = [];
            $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
          };

          $scope.$watchCollection('targets', function() {
            var newOrder = _.pluck($scope.targets, 'id');
            $scope.fullModel.correctResponse = newOrder;
          });

          $scope.init();
        },
        template: [
          '<div class="placement-ordering-config" ng-click="deactivate()">',
          '  <div navigator="">',
          '    <div navigator-panel="Design">',
          designTemplate(),
          '    </div>',
          '    <div navigator-panel="Scoring">',
          '      TODO',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('\n')
      };
    }
  ];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];

