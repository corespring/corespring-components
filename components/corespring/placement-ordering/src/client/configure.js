var main = [
  'ChoiceTemplates',
  'ServerLogic',
  'ComponentImageService',
    function(ChoiceTemplates,
             ServerLogic,
             ComponentImageService) {

      function designTemplate() {

        var feedback = [
          '<div class="input-holder">',
          '  <div class="header">Feedback</div>',
          '  <div class="body">',
          '    <div class="well">',
          '      <div feedback-selector',
          '        fb-sel-label="If correct, show"',
          '        fb-sel-class="correct"',
          '        fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
          '        fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
          '        fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
          '      </div>',
          '    </div>',
          '    <div class="well">',
          '      <div feedback-selector',
          '        fb-sel-label="If partially correct, show"',
          '        fb-sel-class="partial"',
          '        fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
          '        fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
          '        fb-sel-default-feedback="{{defaultPartialFeedback}}">',
          '      </div>',
          '    </div>',
          '    <div class="well">',
          '      <div feedback-selector',
          '        fb-sel-label="If incorrect, show"',
          '        fb-sel-class="incorrect"',
          '        fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
          '        fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
          '        fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>',
          '<div summary-feedback-input ng-model="fullModel.comments"></div>'
        ].join("");

        return [
          '<div class="input-holder">',
          '<div class="body">',
          '<p class="intro">',
          '  In Placement Ordering, a student is asked to sequence events or inputs in a specific order by dragging',
          '  the answers to a placement area.',
          '</p>',
          '<p class="intro">',
          '  Enter your choices into the left column. Place the choices into the right column and drag and drop them',
          '  to set the correct order.',
          '</p>',
          '<table class="choice-columns"><tr>',
          '  <td>',
          '    <input class="prompt" type="text" ng-model="model.config.choiceAreaLabel"',
          '      placeholder="Enter a label or leave blank"/>',
          '    <ul class="sortable-choices draggable-choices" ui-sortable="choicesSortableOptions"',
          '      ng-model="model.choices">',
          '      <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in model.choices"',
          '        ng-model="model.choices[$index]" ng-click="itemClick($event)"',
          '        jqyoui-draggable="{index: {{$index}}, placeholder: \'keep\'}"',
          '        data-jqyoui-options="{revert: \'invalid\'}"',
          '        ng-dblclick="activate($index)">',
          '        <div class="blocker" ng-hide="active[$index]">',
          '          <div class="bg"></div>',
          '          <div class="content">',
          '            <div class="title">Double Click to Edit</div>',
          '          </div>',
          '        </div>',
          '        <div class="delete-icon">',
          '          <i ng-click="deleteChoice($index)" class="fa fa-times-circle"></i>',
          '        </div>',
          '        <div class="remove-after-placing">',
          '          <input id="moveOnDrag{{$index}}" type="checkbox" ng-model="choice.moveOnDrag" />',
          '          <label for="moveOnDrag{{$index}}">Remove tile after placing</label>',
          '        </div>',
          '        <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
          '        <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz="" features="extraFeatures"',
          '          parent-selector=".editor-container"',
          '          image-service="imageService()" />',
          '      </li>',
          '    </ul>',
          '    <button class=\"btn\" ng-click=\"addChoice()\">Add a Choice</button>',
          '  </td>',
          '  <td>',
          '    <input class="prompt" type="text" ng-model="model.config.answerAreaLabel"',
          '      placeholder="Enter a label or leave blank" />',
          '    <div class="draggable-choices-container">',
          '      <ul class="sorted-choices draggable-choices" ui-sortable="targetSortableOptions" ng-model="targets"',
          '        data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
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
          '<label class="shuffle">',
          '  <input type="checkbox" ng-model="model.config.shuffle" />',
          '  Shuffle tiles',
          '</label>',
          '</div>',
          '</div>',
          feedback
        ].join('\n');
      }

      return {
        scope: 'isolate',
        restrict: 'E',
        replace: true,
        controller: ['$scope',
          function($scope) {
            $scope.imageService = function() {
              return ComponentImageService;
            };
          }
        ],
        link: function($scope, $element, $attrs) {

          ChoiceTemplates.extendScope($scope);

          var server = ServerLogic.load('corespring-drag-and-drop-categorize');

          $scope.defaultCorrectFeedback = server.DEFAULT_CORRECT_FEEDBACK;
          $scope.defaultPartialFeedback = server.DEFAULT_PARTIAL_FEEDBACK;
          $scope.defaultIncorrectFeedback = server.DEFAULT_INCORRECT_FEEDBACK;

          $scope.targetDragging = false;

          function initTargets() {
            $scope.targets = _.map($scope.fullModel.correctResponse, function(id) {
              return _.find($scope.model.choices, function(choice) {
                return choice.id === id;
              });
            });
          }

          $scope.containerBridge = {
            setModel: function(model) {
              $scope.fullModel = model;
              $scope.model = $scope.fullModel.model;
              initTargets();
            },
            getModel: function() {
              var model = _.cloneDeep($scope.fullModel);
              return model;
            }
          };

          $scope.droppableOptions = {
            accept: function() {
              var contains = _($scope.targets).pluck('id').contains($scope.draggging);
              return !$scope.targetDragging && !contains;
            }
          };

          function setRemoveAfterPlacingVisibility(ui, visibility){
            ui.item.find('.remove-after-placing').css('visibility', visibility);
          }

          $scope.choicesSortableOptions = {
            disabled: false,
            start: function(event, ui) {
              var li = ui.item;
              $scope.draggging = li.data('choice-id');
              setRemoveAfterPlacingVisibility(ui, 'hidden');
            },
            stop: function(event,ui) {
              setRemoveAfterPlacingVisibility(ui, 'visible');
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

            if (isField($event)) {
              $event.stopPropagation();
              $event.preventDefault();
            } else {
              $scope.deactivate();
            }
          };

          $scope.deactivate = function() {
            $scope.active = _.map($scope.model.choices, function() {
              return false;
            });
            $scope.choicesSortableOptions.disabled = false;
            $scope.$emit('mathJaxUpdateRequest');
          };

          $scope.addChoice = function() {
            function getNextId() {
              var prefix = 'id_';
              var id = 1;
              function isTaken(choice) {
                return choice.id === (prefix + id);
              }
              while(_.find($scope.model.choices, isTaken)) {
                id++;
              }
              return prefix + id;
            }
            $scope.model.choices.push({content: "", label: "", id: getNextId()});
          };

          $scope.deleteChoice = function(index) {
            var choice = $scope.model.choices.splice(index, 1);
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
                 ChoiceTemplates.scoring(),
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

