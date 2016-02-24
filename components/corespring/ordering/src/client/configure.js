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
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <p>',
        '        After setting up the choices, drag and drop them into the correct order. Students will see a',
        '        shuffled version of the choices. Students will order the choices in place, unless the <i>include',
        '        placement area</i> option is selected.',
        '      </p>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <h3>Choices</h3>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-md-12">',
        '      <p>Add a label to choice area</p>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-md-7">',
        '        <div class="prompt" mini-wiggi-wiz=""',
        '            features="extraFeaturesForChoices"',
        '            ng-model="model.config.choiceAreaLabel"',
        '            placeholder="Enter a label or leave blank"',
        '            feature-overrides="overrideFeatures">',
        '        </div>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <div ng-style="{\'visibility\': config.placementToggle ? \'visible\':\'hidden\'}">',
        '        <remove-after-placing choices="fullModel.model.choices"></remove-after-placing>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <ul class="sortable-choices draggable-choices clearfix"',
        '          ui-sortable="choicesSortableOptions" ng-model="model.choices">',
        '        <li class="sortable-choice col-md-7 col-md-offset-2-5" data-choice-id="{{choice.id}}"',
        '            ng-repeat="choice in model.choices"',
        '            ng-model="model.choices[$index]" ng-click="itemClick($event)"',
        '            jqyoui-draggable="{index: {{$index}}, placeholder: \'keep\'}"',
        '            data-jqyoui-options="{revert: \'invalid\'}">',
        '          <div class="blocker" ng-click="activate($index, $event)" ng-hide="active[$index]">',
        '            <div class="bg">',
        '              <span class="placeholder" ng-show="!hasChoice($index)">Enter a choice</span>',
        '            </div>',
        '            <div class="content">',
        '              <ul class="edit-controls">',
        '                <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true" ',
        '                    tooltip-placement="bottom">',
        '                  <i class="fa fa-pencil"></i>',
        '                </li>',
        '                <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true"',
        '                    tooltip-placement="bottom">',
        '                  <i ng-click="removeChoice($index)" class="fa fa-trash-o"></i>',
        '                </li>',
        '              </ul>',
        '            </div>',
        '          </div>',
        '          <div class="remove-after-placing"',
        '              ng-style="{\'visibility\': config.placementToggle ? \'visible\':\'hidden\'}">',
        '            <checkbox id="moveOnDrag{{$index}}" ng-model="choice.moveOnDrag">',
        '              Remove tile after placing',
        '            </checkbox>',
        '          </div>',
        '          <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
        '          <div ng-show="active[$index]" ng-model="choice.label" mini-wiggi-wiz=""',
        '              features="extraFeaturesForChoices"',
        '              parent-selector=".modal-body">',
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
        '  </div>',
        '  <div class="placement-row-group">',
        '    <div class="row placement-row" ng-style="{\'visibility\': config.placementToggle ? \'visible\':\'hidden\'}">',
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
        '    <div class="row display-row"',
        '        ng-show="model.config.placementType == \'placement\' && model.config.choiceAreaLayout === \'horizontal\'">',
        '      <div class="col-xs-12">',
        '        <label class="control-label">Show choices </label>',
        '        <select ng-model="model.config.choiceAreaPosition" class="form-control"',
        '            ng-options="position.value as position.name for position in horizontalChoicesPosition"></select> ',
        '        <label class="control-label"> placement area</label>',
        '      </div>',
        '    </div>',
        '    <div class="row">',
        '      <div class="col-xs-4">',
        '        <checkbox ng-model="config.placementToggle">Include placement area</checkbox>',
        '      </div>',
        '      <div class="col-xs-4" ng-style="{\'visibility\': config.placementToggle ? \'visible\':\'hidden\'}">',
        '        <checkbox class="show-ordering" ng-model="model.config.showOrdering">Show numbered guides</checkbox>',
        '      </div>',
        '    </div>',
        '    <div class="row placement-row">',
        '      <div class="col-xs-12" ng-class="{\'hidden\': model.config.placementType == \'inPlace\'}">',
        '        <p>Add a label to placement area</p>',
        '      </div>',
        '    </div>',
        '    <div class="row">',
        '      <div class="col-xs-6" ng-class="{\'hidden\': model.config.placementType == \'inPlace\'}">',
        '         <div mini-wiggi-wiz="" ',
        '             features="extraFeaturesForChoices"',
        '             ng-model="model.config.answerAreaLabel" ',
        '             placeholder="Enter a label or leave blank"',
        '             feature-overrides="overrideFeatures">',
        '         </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="row feedback-row">',
        '    <div class="col-md-7">',
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
              $scope.config = {};
              $scope.config.placementToggle = $scope.model.config.placementType === 'placement';
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

          $scope.choicesSortableOptions = {
            disabled: false,
            start: function(event, ui) {
              var li = ui.item;
              $scope.draggging = li.data('choice-id');
              isDragging = true;
            },
            stop: function(event,ui) {

              //this is flag to not activate the mini-wiggi when the div is Dragging
              $timeout(function() {
                  isDragging = false;
              },500);
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

          $scope.hasChoice = function($index) {
            var choice = $($scope.model.choices[$index].label).text();
            return !_.isEmpty(choice.trim());
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

          $scope.$watch('config.placementToggle', function() {
            $scope.fullModel.model.config.placementType = $scope.config.placementToggle ? 'placement' : 'inPlace';
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

