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

    var intro = [
      '<p>',
      '   In Short Answer &mdash; Drag and Drop, students are asked to complete a sentence, word, phrase or',
      '   equation using context clues presented in the text that surrounds it.',
      '</p>',
    ].join("\n");

    var choices = [
      '<ul class="sortable-choices draggable-choices"',
      '    ui-sortable="choicesSortableOptions" ng-model="model.choices">',
      '  <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in model.choices"',
      '      ng-model="model.choices[$index]" ng-click="itemClick($event)"',
      '      jqyoui-draggable="{index: {{$index}}, placeholder: \'keep\'}"',
      '      data-jqyoui-options="{revert: \'invalid\'}">',
      '    <div class="blocker" ng-hide="active[$index]">',
      '      <div class="bg"></div>',
      '      <div class="content">',
      '        <ul class="edit-controls">',
      '          <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true"',
      '              tooltip-placement="bottom">',
      '            <i ng-click="activate($index, $event)" class="fa fa-pencil"></i>',
      '          </li>',
      '          <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true"',
      '              tooltip-placement="bottom">',
      '            <i ng-click="removeChoice($index)" class="fa fa-trash-o"></i>',
      '          </li>',
      '        </ul>',
      '      </div>',
      '    </div>',
      '    <div class="remove-after-placing">',
      '      <checkbox id="moveOnDrag{{$index}}" ng-model="choice.moveOnDrag">',
      '        Remove tile after placing',
      '      </checkbox>',
      '    </div>',
      '    <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
      '    <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz="" dialog-launcher="external" features="extraFeatures"',
      '        parent-selector=".modal-body"',
      '        image-service="imageService()">',
      '      <edit-pane-toolbar alignment="bottom">',
      '        <div class="btn-group pull-right">',
      '          <button ng-click="closePane()" class="btn btn-sm btn-success" style="float:right;">',
      '            Done',
      '          </button>',
      '        </div>',
      '      </edit-pane-toolbar>',
      '    </div>',
      '  </li>',
      '</ul>',
      '<button class="btn btn-default" ng-click="addChoice()">Add a Choice</button>',
    ].join("\n");

    var answerAreas = [
      '<ul class="sorted-choices draggable-choices" ui-sortable="targetSortableOptions" ng-model="targets"',
      '    data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
      '  <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in targets">',
      '    <div class="delete-icon">',
      '      <i ng-click="removeTarget(choice)" class="fa fa-times-circle"></i>',
      '    </div>',
      '    <span ng-bind-html-unsafe="choice.label"></span>',
      '  </li>',
      '</ul>',
      '<div class="zero-state" ng-show="targets.length == 0">',
      '  Drag and order correct answers here.',
      '</div>'
    ].join("\n");

    var designOptions = [
      '<div class="placement-row-group">',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      '      <checkbox class="shuffle" ng-model="model.config.shuffle">Shuffle Tiles</checkbox>',
      '    </div>',
      '  </div>',
      '  <div class="row display-row">',
      '    <div class="col-xs-12">',
      '      <label class="control-label">Display:</label>',
      '      <select ng-model="model.config.choiceAreaLayout" class="form-control"',
      '          ng-options="layout.value as layout.name for layout in layouts"></select>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    var feedbacks = [
      '<div feedback-panel>',
      '  <div feedback-selector',
      '      fb-sel-label="If correct, show"',
      '      fb-sel-class="correct"',
      '      fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '      fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If partially correct, show"',
      '      fb-sel-class="partial"',
      '      fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '      fb-sel-default-feedback="{{defaultPartialFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If incorrect, show"',
      '      fb-sel-class="incorrect"',
      '      fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '      fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
      '  </div>',
      '</div>'
    ].join("\n");

    var designPanel = [
      '<div class="container-fluid">',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      intro,
      '    </div>',
      '  </div>',
      '  <div class="row" style="margin-bottom: 10px;">',
      '    <div class="col-xs-6">',
      '      <label class="control-label">Choices</label>',
      '    </div>',
      '    <div class="col-xs-6">',
      '      <label class="control-label">Problem Areas</label>',
      '    </div>',
      '  </div>',
      '  <div class="row" style="margin-bottom: 10px;">',
      '    <div class="col-xs-6">',
      choices,
      '    </div>',
      '    <div class="col-xs-6">',
      answerAreas,
      '    </div>',
      '  </div>',
      '  <div class="row" style="margin-bottom: 10px;">',
      '    <div class="col-xs-12">',
      designOptions,
      '    </div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="col-xs-12">',
      feedbacks,
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

        ChoiceTemplates.extendScope($scope, 'corespring-drag-and-drop-inline');

        $scope.layouts = [
          {name: "Horizontal", value: "horizontal"},
          {name: "Vertical", value: "vertical"}
        ];

        $scope.targetDragging = false;

        function initTargets() {
          $scope.targets = _.map($scope.fullModel.correctResponse, function() {
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

        $scope.removeChoice = function(index) {
          var choice = $scope.model.choices.splice(index, 1);
          var choiceId = choice[0].id;
          $scope.fullModel.correctResponse = _.filter($scope.fullModel.correctResponse, function(responseId) {
            return responseId !== choiceId;
          });
          initTargets();
        };

        $scope.removeTarget = function(choice) {
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
        '<div class="drag-and-drop-config-panel drag-and-drop-inline-config" ng-click="deactivate()">',
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

