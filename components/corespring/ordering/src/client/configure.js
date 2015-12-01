/* global exports */

var main = [
  '$timeout',
  'ChoiceTemplates',
  'ComponentImageService',
  "WiggiMathJaxFeatureDef",
   function($timeout,
            ChoiceTemplates,
            ComponentImageService,
            WiggiMathJaxFeatureDef
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
        '  <div class="row">',
        '    <div class="col-xs-6">',
        '      <label class="control-label">Choices</label>',
        '      <p>Add a label to choice area (optional).</p>',
        '    </div>',
        '    <div class="col-xs-6" ng-class="{\'hidden\': model.config.placementType == \'inPlace\'}">',
        '      <label class="control-label">Placement Area</label>',
        '      <p>Add a label to placement area (optional)</p>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-6">',
        '        <div class="prompt" mini-wiggi-wiz="" ',
        '           dialog-launcher="external" ',
        '           features="extraFeaturesForChoices"',
        '           image-service="imageService()" ',
        '           ng-model="model.config.choiceAreaLabel" ',
        '           placeholder="Enter a label or leave blank"',
        '           feature-overrides="overrideFeatures"',
        '        >',
        '        </div>',
        '    </div>',
        '    <div class="col-xs-6" ng-class="{\'hidden\': model.config.placementType == \'inPlace\'}">',
        '       <div mini-wiggi-wiz="" ',
        '           dialog-launcher="external" ',
        '           features="extraFeaturesForChoices"',
        '           image-service="imageService()" ',
        '           ng-model="model.config.answerAreaLabel" ',
        '           placeholder="Enter a label or leave blank"',
        '           feature-overrides="overrideFeatures"',
        '        >',
        '        </div>',
        '    </div>',
        '  </div>',
        '  <div class="row choices-row">',
        '    <div class="col-xs-6">',
        '      <label class="control-label">Enter Choices</label>',
        '      <checkbox ng-model="config.removeAllAfterPlacing" ng-show="model.config.placementType == \'placement\'">',
        '        Remove <strong>all</strong> tiles after placing',
        '      </checkbox>',
        '      <ul class="sortable-choices draggable-choices"',
        '          ui-sortable="choicesSortableOptions" ng-model="model.choices">',
        '        <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in model.choices"',
        '            ng-model="model.choices[$index]" ng-click="itemClick($event)"',
        '            jqyoui-draggable="{index: {{$index}}, placeholder: \'keep\'}"',
        '            data-jqyoui-options="{revert: \'invalid\'}">',
        '          <div class="blocker" ng-click="activate($index, $event)" ng-hide="active[$index]">',
        '            <div class="bg"></div>',
        '            <div class="content">',
        '              <ul class="edit-controls">',
        '                <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true"',
        '                    tooltip-placement="bottom">',
        '                  <i ng-click="removeChoice($index)" class="fa fa-trash-o"></i>',
        '                </li>',
        '              </ul>',
        '            </div>',
        '          </div>',
        '          <div class="remove-after-placing" ng-show="model.config.placementType == \'placement\'">',
        '            <checkbox id="moveOnDrag{{$index}}" ng-model="choice.moveOnDrag">',
        '              Remove tile after placing',
        '            </checkbox>',
        '          </div>',
        '          <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
        '          <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz="" dialog-launcher="external" features="extraFeaturesForChoices"',
        '              parent-selector=".modal-body"',
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
        '      <label class="control-label">Drag to Placement Area:</label>',
        '      <ul class="sorted-choices draggable-choices" ui-sortable="targetSortableOptions" ng-model="targets"',
        '          data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
        '        <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in targets">',
        '          <div class="delete-icon">',
        '            <i ng-click="removeTarget(choice)" class="fa fa-close"></i>',
        '          </div>',
        '          <span ng-bind-html-unsafe="choice.label"></span>',
        '        </li>',
        '      </ul>',
        '      <div class="zero-state" ng-show="targets.length == 0">',
        '        Drag and order correct answers here.',
        '      </div>',
        '      <div>',
        '        <checkbox class="show-ordering" ng-model="model.config.showOrdering">Show numbered guides</checkbox>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="placement-row-group" >',
        '    <div class="row" ng-show="model.config.placementType == \'placement\'">',
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
        '    <div class="row display-row" ng-show="model.config.placementType == \'placement\' && model.config.choiceAreaLayout === \'horizontal\'">',
        '      <div class="col-xs-12">',
        '        <label class="control-label">Show choices </label>',
        '        <select ng-model="model.config.choiceAreaPosition" class="form-control"',
        '            ng-options="position.value as position.name for position in horizontalChoicesPosition"></select> ',
        '        <label class="control-label"> placement area</label>',
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
        scope: {},
        restrict: 'E',
        replace: true,
        controller: ['$scope',
          function($scope) {
            $scope.imageService = function() {
              return ComponentImageService;
            };

            $scope.extraFeaturesForChoices = {
              definitions: [
                new WiggiMathJaxFeatureDef()
              ]
            };
          }
        ],
        link: function($scope, $element, $attrs) {

          ChoiceTemplates.extendScope($scope, 'corespring-ordering');

          $scope.layouts = [
            {name: "Horizontal", value: "horizontal"},
            {name: "Vertical", value: "vertical"}
          ];

          $scope.horizontalChoicesPosition = [
            {name: "Above", value: "above"},
            {name: "Below", value: "below"}
          ];

          $scope.config = {};

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
              var fullModel = _.cloneDeep($scope.fullModel);
              if (fullModel.model.config.placementType === 'inPlace') {
                fullModel.correctResponse = _.pluck(fullModel.model.choices, 'id');
              }
              return fullModel;
            }
          };

          var isDragging = false;

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
              isDragging = true;
              setRemoveAfterPlacingVisibility(ui, 'hidden');
            },
            stop: function(event,ui) {

              //this is flag to not activate the mini-wiggi when the div is Dragging
              $timeout(function() {
                  isDragging = false;
              },500);
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
            if (isDragging) {
              return;
            }

            $scope.deactivate();
            if ($event) {
              $event.stopPropagation();
            }
            $scope.active[$index] = true;
            $scope.choicesSortableOptions.disabled = true;
            $timeout(function() {
              var $editable = $element.find($('.sortable-choice')[$index]).find('.wiggi-wiz-editable');
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

          $scope.$on('math-updated', function() {
            $scope.activate(_.findIndex($scope.active));
          });

          $scope.$watchCollection('targets', function(n) {
            if (!_.isEmpty(n)) {
              var newOrder = _.pluck($scope.targets, 'id');
              $scope.fullModel.correctResponse = newOrder;
              $scope.updateNumberOfCorrectResponses(getNumberOfCorrectResponses());
            }
          });

          $scope.$watch('config.removeAllAfterPlacing', function() {
            if ($scope.config.removeAllAfterPlacing) {
              _.each($scope.fullModel.model.choices, function(choice) {
                choice.moveOnDrag = true;
              });
            }
          });

          $scope.$watch('fullModel.model.choices', function() {
            $scope.config.removeAllAfterPlacing = _.find($scope.fullModel.model.choices, function(choice) {
              return (choice.moveOnDrag !== true);
            }) == undefined;
          }, true);

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

