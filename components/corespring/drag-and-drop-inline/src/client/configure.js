/* global exports */

var main = [
  '$log',
  '$timeout',
  'ChoiceTemplates',
  'ComponentImageService',
  'WiggiAnswerAreaFeatureDef',
  function($log,
    $timeout,
    ChoiceTemplates,
    ComponentImageService,
    WiggiAnswerAreaFeatureDef
  ) {

    "use strict";

    return {
      scope: {},
      restrict: 'E',
      replace: true,
      template: template(),
      controller: function($scope) {
        $scope.imageService = function() {
          return ComponentImageService;
        };

        $scope.extraFeaturesForAnswerAreas = {
          definitions: [
            {
              name: 'answer-area-inline',
              addToEditor: '<div answer-area-inline="" class="answer-area-inline" from="addToEditor">answer area content</div>',
              initialise: function($node, replaceWith) {
                return replaceWith($('<div answer-area-inline="" class="answer-area-inline" from="initialise"></div>'));
              },
              compile: true,
              onDblClick: function($node, $scope, editor) {
                $log.debug('onDblClick!!');
              },
              editInstance: function($node, $scope, editor) {
                $log.debug('editInstance', $node);
              },
              getMarkUp: function($node) {
                return '<div answer-area-inline="" class="answer-area-inline" from="getMarkUp"></div>';
              }
            }]
        };
      },
      link: function($scope, $element, $attrs) {

        ChoiceTemplates.extendScope($scope, 'corespring-drag-and-drop-inline');

        $scope.layouts = [
          {
            name: "Horizontal",
            value: "horizontal"
          },
          {
            name: "Vertical",
            value: "vertical"
          }
        ];

        $scope.targetDragging = false;

        function findChoice(id) {
          var result = _.find($scope.model.choices, function(choice) {
            return choice.id === id;
          });
          return result;
        }

        function isChoiceInTargets(id) {
          var result = false;
          _.forEach($scope.targets, function(choiceIds, answerAreaId) {
            if (_.contains(choiceIds, id)) {
              result = true;
            }
          });
          return result;
        }

        function fromCorrectResponseToTargets(correctResponse) {
          var targets = {};
          _.forEach(correctResponse, function(choiceIds, answerAreaId) {
            targets[answerAreaId] = _.map(choiceIds, function(id) {
              //clone to be able to add a choice multiple times
              return _.clone(findChoice(id));
            });
          });
          return targets;
        }

        function fromTargetsToCorrectResponse(targets) {
          var correctResponse = {};
          _.forEach(targets, function(choices, answerAreaId) {
            correctResponse[answerAreaId] = _.pluck(choices, 'id');
          });
          return correctResponse;
        }

        function initTargets() {
          var targets = fromCorrectResponseToTargets($scope.fullModel.correctResponse);
          $scope.targets = targets;
        }

        function getNumberOfCorrectResponses() {
          var result = 0;
          if ($scope.fullModel && $scope.fullModel.correctResponse) {
            _.forEach($scope.fullModel.correctResponse, function(choiceIds, answerAreaId) {
              result += choiceIds.length;
            });
          }
          return result;
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
            return !$scope.targetDragging;
          }
        };

        function setRemoveAfterPlacingVisibility(item, visible) {
          item.find('.remove-after-placing').css('visibility', visible ? 'visible' : 'hidden');
        }

        $scope.onStartDraggingChoice = function(event) {
          setRemoveAfterPlacingVisibility($(event.currentTarget), false);
        };

        $scope.onStopDraggingChoice = function(event) {
          setRemoveAfterPlacingVisibility($(event.currentTarget), true);
        };

        $scope.choiceDraggableOptions = function(index) {
          return {
            index: index,
            placeholder: 'keep',
            onStart: 'onStartDraggingChoice(event)',
            onStop: 'onStopDraggingChoice(event)'
          };
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
          function activateWiggi() {
            var $editable = $($event.target).closest('.sortable-choice').find('.wiggi-wiz-editable');
            $editable.click();
            angular.element($editable).scope().focusCaretAtEnd();
          }
          $event.stopPropagation();
          $scope.active[$index] = true;
          $timeout(activateWiggi);
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
          $scope.$emit('mathJaxUpdateRequest');
        };

        $scope.isActive = function() {
          return _.contains($scope.active, true);
        };


        function makeChoiceId(slot) {
          return "c_" + slot;
        }

        function findFreeChoiceSlot() {
          var slot = 1;
          var ids = _.pluck($scope.model.choices, 'id');
          while (_.contains(ids, makeChoiceId(slot))) {
            slot++;
          }
          return slot;
        }

        $scope.addChoice = function() {
          $scope.model.choices.push({
            content: "",
            label: "",
            id: makeChoiceId(findFreeChoiceSlot()),
            moveOnDrag: true
          });
        };

        function removeChoiceFromCorrectResponse(choiceId) {
          _.forEach($scope.fullModel.correctResponse, function(choiceIds, answerAreaId) {
            _.remove(choiceIds, choiceId);
          });
        }

        $scope.removeChoice = function(index) {
          var choice = $scope.model.choices.splice(index, 1);
          var choiceId = choice[0].id;
          removeChoiceFromCorrectResponse(choiceId);
          initTargets();
        };

        function makeAnswerAreaId(slot) {
          return "aa_" + slot;
        }

        function findFreeAnswerAreaSlot() {
          var slot = 1;
          var ids = _.pluck($scope.model.answerAreas, 'id');
          while (_.contains(ids, makeAnswerAreaId(slot))) {
            slot++;
          }
          return slot;
        }

        $scope.addAnswerArea = function() {
          var slot = findFreeAnswerAreaSlot();
          var answerAreaId = makeAnswerAreaId(slot);
          $scope.model.answerAreas.push({
            "id": answerAreaId,
            "textBefore": "",
            "textAfter": ""
          });
          $scope.targets[answerAreaId] = [];
        };

        $scope.removeAnswerArea = function(answerArea) {
          var answerAreaId = answerArea.id;
          _.remove($scope.model.answerAreas, answerArea);
          delete $scope.targets[answerAreaId];
          //fullModel.correctResponse is updated through the $watch on targets
        };

        $scope.removeTarget = function(answerAreaId, choiceIndex) {
          var targetChoices = $scope.targets[answerAreaId];
          if (_.isArray(targetChoices)) {
            targetChoices.splice(choiceIndex, 1);
          } else {
            console.error("target is not an array?", answerAreaId, choiceIndex, $scope.targets);
          }
        };


        var TARGET_ID = 100;

        //to avoid the duplicate id error in the repeater of the answerArea
        //we are using our own tracking id function, which should never return
        //a duplicate
        $scope.targetId = function(choice) {
          return TARGET_ID++;
        };

        $scope.$watch('targets', function(newValue, oldValue) {
          console.log("watch targets", newValue, oldValue);
          var newOrder = fromTargetsToCorrectResponse(newValue);
          $scope.fullModel.correctResponse = newOrder;
          $scope.updatePartialScoringModel(getNumberOfCorrectResponses());
          console.log("targets", $scope.targets);
          console.log("choices", $scope.model.choices);
        }, true);

        $scope.init = function() {
          $scope.active = [];
          $scope.$emit('registerConfigPanel', $attrs.id, $scope.containerBridge);
        };

        $scope.init();
      }
    };

    function template() {
      var intro = [
        '<p>',
        '   In Short Answer &mdash; Drag and Drop, students are asked to complete a sentence, word, phrase or',
        '   equation using context clues presented in the text that surrounds it.',
        '</p>'
      ].join("\n");

      var choices = [
        '<ul class="sortable-choices draggable-choices"',
        '    ng-model="model.choices">',
        '  <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in model.choices"',
        '      ng-model="model.choices[$index]" ng-click="itemClick($event)"',
        '      jqyoui-draggable="choiceDraggableOptions($index)"',
        '      data-drag="!isActive()" data-jqyoui-options="{revert: \'invalid\'}">',
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
        '    <div mini-wiggi-wiz=""',
        '        ng-show="active[$index]"',
        '        ng-model="choice.label"',
        '        dialog-launcher="external"',
        '        features="extraFeatures"',
        '        parent-selector=".modal-body"',
        '        image-service="imageService()">',
        '    </div>',
        '  </li>',
        '</ul>',
        '<button class="btn btn-default" ng-click="addChoice()">Add a Choice</button>'
      ].join("\n");

      var answerAreas = [
        '<div id="answerAreasWiggi" mini-wiggi-wiz=""',
        '    ng-model="answerAreasXhtml"',
        '    dialog-launcher="external"',
        '    features="extraFeaturesForAnswerAreas"',
        '    parent-selector=".modal-body"',
        '    image-service="imageService()">',
        '</div>',
        '<div class="row" ng-repeat="answerArea in model.answerAreas">',
        '  <div class="col-xs-12 answer-area">',
        '    <div class="remove-button" ng-click="removeAnswerArea(answerArea)"><i class="fa fa-trash-o"></i></div>',
        '    <div><label class="control-label">Problem {{($index+1)}}</label></div>',
        '    <ul class="sorted-choices draggable-choices" ui-sortable="targetSortableOptions" ng-model="targets[answerArea.id]"',
        '        data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
        '      <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in targets[answerArea.id] track by targetId(choice)">',
        '        <div class="delete-icon">',
        '          <i ng-click="removeTarget(answerArea.id, $index)" class="fa fa-times-circle"></i>',
        '        </div>',
        '        <span ng-bind-html-unsafe="choice.label"></span>',
        '      </li>',
        '    </ul>',
        '    <div class="zero-state" ng-show="!targets[answerArea.id].length">',
        '      Drag and order correct answers here.',
        '    </div>',
        '  </div>',
        '</div>',
        '<div class="row">',
        ' <div class="col-xs-12">',
        '   <button id="add-choice" class="btn btn-default" ',
        '     ng-click="addAnswerArea()">Add Problem Area</button>',
        '   </div>',
        ' </div>'
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

      return [
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
      ].join('\n');

    }
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];