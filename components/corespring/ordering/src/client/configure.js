/* global exports */

var main = [
  '$timeout',
  'ChoiceTemplates',
  'ComponentImageService',
   function($timeout,
            ChoiceTemplates,
            ComponentImageService
   ) {

     "use strict";

      var designPanel = [
        '<div class="container-fluid">',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <p>In Ordering, a student is asked to sequence events or inputs in a specific order.</p>',
        '    </div>',
        '  </div>',
        '  <div class="row placement-row">',
        '    <div class="col-xs-2">',
        '      <radio ng-model="model.config.placementType" value="inPlace">In Place</radio>',
        '    </div>',
        '    <div class="col-xs-2">',
        '      <radio ng-model="model.config.placementType" value="placement">Placement</radio>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <p ng-if="model.config.placementType == \'placement\'">',
        '        Placement area ordering requires the student to drag their choices to a placement area to order. Not',
        '        all tiles must be used.</br>Drag & drop the tiles to the placement area to set the correct order.',
        '        Students will see a shuffled version of the choices.',
        '      </p>',
        '      <p ng-if="model.config.placementType != \'placement\'">',
        '        In place ordering asks the student to order within a list. The student must order all of the choices.',
        '        <br>Drag & drop the tiles to set the correct order. Students will see a shuffled version of the',
        '        choices.',
        '      </p>',
        '    </div>',
        '  </div>',
        '  <div class="row" ng-class="{\'hidden\': model.config.placementType == \'inPlace\'}">',
        '    <div class="col-xs-6">',
        '      <input class="prompt" type="text"',
        '          ng-model="model.config.choiceAreaLabel" placeholder="Enter a label or leave blank"/>',
        '    </div>',
        '    <div class="col-xs-6">',
        '    <input class="prompt" type="text" ng-model="model.config.answerAreaLabel"',
        '        placeholder="Enter a label or leave blank" />',
        '    </div>',
        '  </div>',
        '  <div class="row choices-row">',
        '    <div ng-class="{\'col-xs-6\': model.config.placementType == \'placement\', \'col-xs-12\': model.config.placementType == \'inPlace\'}">',
        '      <ul class="sortable-choices draggable-choices"',
        '          ui-sortable="choicesSortableOptions" ng-model="model.choices">',
        '        <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in model.choices"',
        '            ng-model="model.choices[$index]" ng-click="itemClick($event)"',
        '            jqyoui-draggable="{index: {{$index}}, placeholder: \'keep\'}"',
        '            data-jqyoui-options="{revert: \'invalid\'}">',
        '          <div class="blocker" ng-hide="active[$index]">',
        '            <div class="bg"></div>',
        '            <div class="content">',
        '              <ul class="edit-controls">',
        '                <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true"',
        '                    tooltip-placement="bottom">',
        '                  <i ng-click="activate($index, $event)" class="fa fa-pencil"></i>',
        '                </li>',
        '                <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true"',
        '                    tooltip-placement="bottom">',
        '                  <i ng-click="deleteChoice($index)" class="fa fa-trash-o"></i>',
        '                </li>',
        '              </ul>',
        '            </div>',
        '          </div>',
        '          <div class="remove-after-placing">',
        '            <checkbox id="moveOnDrag{{$index}}" ng-model="choice.moveOnDrag">',
        '              Remove tile after placing',
        '            </checkbox>',
        '          </div>',
        '          <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
        '          <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz="" features="extraFeatures"',
        '              parent-selector=".editor-container"',
        '              image-service="imageService()">',
        '            <edit-pane-toolbar alignment="bottom">',
        '              <div class="btn-group pull-right">',
        '                <button ng-click="closePane()" class="btn btn-sm btn-success" style="float:right;">',
        '                  Done',
        '                </button>',
        '              </div>',
        '            </edit-pane-toolbar>',
        '          </div>',
        '        </li>',
        '      </ul>',
        '      <button class="btn btn-default" ng-click="addChoice()">Add a Choice</button>',
        '    </div>',
        '    <div class="col-xs-6" ng-show="model.config.placementType == \'placement\'">',
        '      <ul class="sorted-choices draggable-choices" ui-sortable="targetSortableOptions" ng-model="targets"',
        '          data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
        '        <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in targets">',
        '          <div class="delete-icon">',
        '            <i ng-click="deleteTarget(choice)" class="fa fa-times-circle"></i>',
        '          </div>',
        '          <span ng-bind-html-unsafe="choice.label"></span>',
        '        </li>',
        '      </ul>',
        '      <div class="zero-state" ng-show="targets.length == 0">',
        '        Drag and order correct answers here.',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="placement-row-group" ng-show="model.config.placementType == \'placement\'">',
        '    <div class="row">',
        '      <div class="col-xs-12">',
        '        <checkbox class="shuffle" ng-model="model.config.shuffle">Shuffle Tiles</checkbox>',
        '      </div>',
        '    </div>',
        '    <div class="row display-row">',
        '      <div class="col-xs-12">',
        '        <label class="control-label">Display:</label>',
        '        <select ng-model="model.config.choiceAreaLayout" class="form-control"',
        '            ng-options="layout.value as layout.name for layout in layouts"></select>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <div feedback-panel>',
        '        <div feedback-selector',
        '            fb-sel-label="If correct, show"',
        '            fb-sel-class="correct"',
        '            fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
        '            fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
        '            fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
        '        </div>',
        '        <div feedback-selector',
        '            fb-sel-label="If partially correct, show"',
        '            fb-sel-class="partial"',
        '            fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
        '            fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
        '            fb-sel-default-feedback="{{defaultPartialFeedback}}">',
        '        </div>',
        '        <div feedback-selector',
        '            fb-sel-label="If incorrect, show"',
        '            fb-sel-class="incorrect"',
        '            fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
        '            fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
        '            fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

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

          ChoiceTemplates.extendScope($scope, 'corespring-ordering');

          $scope.layouts = [
            {name: "Horizontal", value: "horizontal"},
            {name: "Vertical", value: "vertical"}
          ];

          $scope.targetDragging = false;

          function initTargets() {
            $scope.targets = _.map($scope.fullModel.correctResponse, function(id) {
              return _.find($scope.model.choices, function(choice) {
                return choice.id === id;
              });
            });
          }

          function getNumberOfCorrectResponses() {
            return $scope.fullModel && $scope.fullModel.correctResponse ? $scope.fullModel.correctResponse.length : 0;
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

          $scope.activate = function($index, $event) {
            $event.stopPropagation();
            $scope.active[$index] = true;
            $scope.choicesSortableOptions.disabled = true;
            $timeout(function() {
              var $editable = $($event.target).closest('.sortable-choice').find('.wiggi-wiz-editable');
              $editable.click();
              angular.element($editable).scope().focusCaretAtEnd();
            });
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

          function findFreeChoiceSlot(){
            var slot = 1;
            var ids = _.pluck($scope.model.choices, 'id');
            while(_.contains(ids, "id_" + slot)){
              slot++;
            }
            return slot;
          }

          $scope.addChoice = function() {

            $scope.model.choices.push({
              content: "",
              label: "",
              id: "id_" + findFreeChoiceSlot(),
              moveOnDrag: true});
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

          $scope.$watchCollection('targets', function() {
            var newOrder = _.pluck($scope.targets, 'id');
            $scope.fullModel.correctResponse = newOrder;
            $scope.updatePartialScoringModel(getNumberOfCorrectResponses());
          });

          $scope.init = function() {
            $scope.active = [];
            $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
          };

          $scope.init();
        },
        template: [
          '<div class="ordering-config" ng-click="deactivate()">',
          '  <div navigator-panel="Design">',
               designPanel,
          '  </div>',
          '  <div navigator-panel="Scoring">',
          '    <div class="container-fluid">',
          '      <div class="row">',
          '        <div class="col-xs-12">',
                     ChoiceTemplates.scoring(),
          '        </div>',
          '      </div>',
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

