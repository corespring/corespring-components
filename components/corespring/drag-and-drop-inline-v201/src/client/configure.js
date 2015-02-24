/* globals console, exports */

var main = [
  "$timeout",
  "ChoiceTemplates",
  "ComponentImageService",
  "WiggiLinkFeatureDef",
  "WiggiMathJaxFeatureDef",
  function($timeout, ChoiceTemplates, ComponentImageService, WiggiLinkFeatureDef, WiggiMathJaxFeatureDef) {

    "use strict";

    return {
      restrict: "E",
      scope: {},
      replace: true,
      template: template(),
      controller: ['$scope', function($scope){
        $scope.imageService = function() {
          return ComponentImageService;
        };

        $scope.extraFeaturesForAnswerArea = {
          definitions: [
            new WiggiMathJaxFeatureDef(),
            new WiggiLinkFeatureDef(),
            {
              name: 'answer-area-inline-v201',
              title: 'Add Answer Blank',
              draggable: false,
              compile: true,
              addToEditor: function(editor, addContent) {
                var id = $scope.addAnswerArea();
                addContent($('<answer-area-inline-v201 id="' + id +'"/>'));
              },
              deleteNode: function($node, services) {
                var id = $node.attr('answer-area-id');
                $scope.removeAnswerArea(id);
              },
              initialise: function($node, replaceWith) {
                var id = $node.attr('id');
                return replaceWith($('<div cs-config-answer-area-inline-v201 answer-area-id="' + id + '"/>'));
              },
              onDblClick: function($node, $scope, editor) {
              },
              editInstance: function($node, $scope, editor) {
              },
              getMarkUp: function($node) {
                var id = $node.attr('answer-area-id');
                return '<answer-area-inline-v201 id="' + id +'"/>';
              }
            }]
        };
      }],
      link: function(scope, element, attrs) {

        ChoiceTemplates.extendScope(scope, 'corespring-drag-and-drop-inline-v201');

        scope.correctAnswers = {};

        scope.choiceToDropDownItem = function(c) {
          if (!c) {
            return;
          }
          if (c.labelType === 'image') {
            return c.imageName;
          }
          return c.label;
        };

        scope.choiceToLetter = function(c) {
          var idx = scope.model.choices.indexOf(c);
          return scope.toChar(idx);
        };

        function sumCorrectAnswers() {
          return _.reduce(scope.correctAnswers, function(memo, ca) {
            return ca.length + memo;
          }, 0);
        }

        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            scope.model = scope.fullModel.model;

            function choiceById(cid) {
              return _.find(model.model.choices, {id:cid});
            }

            _.each(model.correctResponse, function(val, key) {
              scope.correctAnswers[key] = _.map(val, function(choiceId) {
                return choiceById(choiceId);
              });
            });

            scope.updatePartialScoringModel(sumCorrectAnswers());

            scope.componentState = "initialized";
          },
          getModel: function() {
            var model = _.cloneDeep(scope.fullModel);
            return model;
          },
          getAnswer: function() {
            return {};
          }
        };

        scope.$watch('correctAnswers', function(n) {
          if (n) {
            var correctResponse = {};
            _.each(scope.correctAnswers, function(val, key) {
              correctResponse[key] = _.pluck(val, 'id');
            });
            scope.fullModel.correctResponse = correctResponse;
            scope.updatePartialScoringModel(sumCorrectAnswers());
          }
        }, true);

        scope.removeChoice = function(id) {
          _.remove(scope.model.choices, {id:id});
          _.each(scope.correctAnswers, function(val, key) {
            _.remove(val, {id:id});
          });
        };

        function findFreeChoiceSlot(){
          var slot = 1;
          var ids = _.pluck(scope.model.choices, 'id');
          while(_.contains(ids, "c_" + slot)){
            slot++;
          }
          return slot;
        }

        scope.addChoice = function() {
          scope.model.choices.push({
            id: "c_" + findFreeChoiceSlot(),
            labelType: "text",
            label: "",
            removeAfterPlacing: false
          });
        };

        function findFreeAnswerAreaSlot(){
          var slot = 1;
          var ids = _.pluck(scope.model.answerAreas, 'id');
          while(_.contains(ids, "aa_" + slot)){
            slot++;
          }
          return slot;
        }

        scope.addAnswerArea = function() {
          var answerAreaId = "aa_" + findFreeAnswerAreaSlot();
          scope.model.answerAreas.push({
            id: answerAreaId
          });
          scope.correctAnswers[answerAreaId] = [];
          return answerAreaId;
        };

        scope.removeAnswerArea = function(answerAreaId) {
          _.remove(scope.model.answerAreas, {id: answerAreaId});
          delete scope.correctAnswers[answerAreaId];
        };

        scope.$on('getConfigScope', function(event, callback){
          callback(scope);
        });

        scope.$on('removeCorrectAnswer', function(event, answerAreaId, index){
          scope.correctAnswers[answerAreaId].splice(index,1);
        });

        scope.choiceDraggableOptions = function(index) {
          return {
            index: index,
            placeholder: 'keep',
            deepCopy: true
          };
        };

        scope.choiceDraggableJqueryOptions = function(choice){
          return {
            revert: 'invalid',
            helper: function(){
                return $('<div class="corespring-drag-and-drop-inline-drag-helper-v201">' + choice.label + '</div>');
              },
            appendTo: ".modal",
            cursorAt: {
              bottom: 5,
              right: 5
            }
          };
        };

        scope.active = [];

        scope.canDragChoices = true;

        scope.activate = function($index, $event) {
          $event.stopPropagation();
          scope.active = [];
          scope.active[$index] = true;
          $timeout(function() {
            var $editable = $($event.target).closest('.draggable-choice').find('.wiggi-wiz-editable');
            if($editable.length) {
              $editable.click();
              var editableScope = angular.element($editable).scope();
              if (editableScope && _.isFunction(editableScope.focusCaretAtEnd)) {
                editableScope.focusCaretAtEnd();
              }
            } else {
              //should only happen in dev, when the structure/classes of the choice item are changed
              throw "wiggiwiz editable not found";
            }
          }, 10);
        };

        scope.itemClick = function($event) {
          function isField($event) {
            return $($event.target).parents('.mini-wiggi-wiz').length !== 0;
          }

          if (isField($event)) {
            $event.stopPropagation();
            $event.preventDefault();
          } else {
            scope.deactivate();
          }
        };

        scope.deactivate = function() {
          scope.active = [];
          scope.$emit('mathJaxUpdateRequest');
        };


        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      }
    };

    function template(){
      var introduction = [
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <p>',
        '      In Short Answer &mdash; Drag and Drop, students are asked to complete a sentence, word, phrase or',
        '      equation using context clues presented in the text that surrounds it.',
        '    </p>',
        '  </div>',
        '</div>'
      ].join('\n');

      var answerAreas = [
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <label class="control-label" style="margin-bottom: 10px;">Problem Area</label>',
        '    <p class="answer-area-help-text">Begin typing and click "Add Answer Blank" to insert an answer blank. Drag the correct answer(s) to the blank(s).</p>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <div id="answerAreaWiggi"',
        '      mini-wiggi-wiz=""',
        '      class="active"',
        '      ng-model="model.answerAreaXhtml"',
        '      dialog-launcher="external"',
        '      features="extraFeaturesForAnswerArea"',
        '      parent-selector=".modal-body"',
        '      image-service="imageService()">',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("\n");

      var choices = [
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <label class="control-label" style="margin-bottom: 10px;">Choices Area</label>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '      <input class="prompt" type="text"',
        '          ng-model="model.config.choiceAreaLabel" placeholder="Choice Label"/>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <ul class="draggable-choices" ng-model="model.choices">',
        '      <li class="draggable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in model.choices"',
        '          ng-model="choice" ng-click="itemClick($event)" data-drag="{{!active[$index]}}"',
        '          jqyoui-draggable="choiceDraggableOptions($index)"',
        '          data-jqyoui-options="choiceDraggableJqueryOptions(choice)">',
        '        <div class="blocker" ng-hide="active[$index]">',
        '          <div class="bg"></div>',
        '          <div class="content">',
        '            <ul class="edit-controls">',
        '              <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true"',
        '                  tooltip-placement="bottom" ng-click="activate($index, $event)">',
        '                <i class="fa fa-pencil"></i>',
        '              </li>',
        '              <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true"',
        '                  tooltip-placement="bottom" ng-click="removeChoice(choice.id)">',
        '                <i class="fa fa-trash-o"></i>',
        '              </li>',
        '            </ul>',
        '          </div>',
        '        </div>',
        '        <div class="remove-after-placing">',
        '          <checkbox id="removeAfterPlacing{{$index}}" ng-model="choice.removeAfterPlacing">',
        '            Remove tile after placing',
        '          </checkbox>',
        '        </div>',
        '        <span ng-hide="active[$index]" ng-bind-html-unsafe="choice.label"></span>',
        '        <div ng-show="active[$index]"',
        '            mini-wiggi-wiz=""',
        '            ng-model="choice.label"',
        '            dialog-launcher="external"',
        '            features="extraFeatures"',
        '            parent-selector=".modal-body"',
        '            image-service="imageService()">',
        '          <edit-pane-toolbar alignment="bottom">',
        '            <div class="btn-group pull-right">',
        '              <button ng-click="closePane()" class="btn btn-sm btn-success" style="float:right;">',
        '                Done',
        '              </button>',
        '            </div>',
        '          </edit-pane-toolbar>',
        '        </div>',
        '      </li>',
        '    </ul>',
        '  </div>',
        '</div>',
        '<div class="row add-choice-row">',
        '  <div class="col-xs-12">',
        '    <button type="button" class="btn btn-default add-choice"',
        '        ng-click="addChoice()">Add a Choice</button>',
        '  </div>',
        '</div>',
        '<div class="row shuffle-choices-row">',
        '  <div class="col-xs-12">',
        '    <checkbox class="shuffle-choices" ng-model="model.config.shuffle">Shuffle Choices</checkbox>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <span>Display choices</span>',
        '    <select class="form-control choice-area-position" ng-model="model.config.choiceAreaPosition"',
        '       ng-options="c for c in [\'above\', \'below\']">',
        '    </select>',
        '  </div>',
        '</div>'
      ].join("\n");

      var feedback = [
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <div feedback-panel>',
        '      <div feedback-selector',
        '          fb-sel-label="If correct, show"',
        '          fb-sel-class="correct"',
        '          fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
        '          fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
        '          fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
        '      </div>',
        '      <div feedback-selector',
        '          fb-sel-label="If partially correct, show"',
        '          fb-sel-class="partial"',
        '          fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
        '          fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
        '          fb-sel-default-feedback="{{defaultPartialFeedback}}">',
        '      </div>',
        '      <div feedback-selector',
        '          fb-sel-label="If incorrect, show"',
        '          fb-sel-class="incorrect"',
        '          fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
        '          fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
        '          fb-sel-default-feedback="{{defaultIncorrectFeedback}}">' +
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("\n");

      var designOptions = [
        '<div class="container-fluid" ng-click="deactivate()">',
          introduction,
        '  <div class="row choices-and-answers">',
        '    <div class="col-xs-6">',
          choices,
        '    </div>',
        '    <div class="col-xs-6">',
          answerAreas,
        '    </div>',
        '  </div>',
          feedback,
        '</div>'
      ].join('\n');

      var scoringOptions = [
        '<div class="container-fluid">',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        ChoiceTemplates.scoring(),
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var result = [
        '<div class="corespring-drag-and-drop-inline-config-v201" choice-template-controller="">',
        '  <div navigator-panel="Design">',
        designOptions,
        '  </div>',
        '  <div navigator-panel="Scoring">',
        scoringOptions,
        '  </div>',
        '</div>'
      ].join('\n');

      return result;
    }
  }
];


var csConfigAnswerAreaInline = [
  '$log',
  function($log) {
    "use strict";
    return {
      scope:{},
      restrict: 'A',
      replace: true,
      link: function(scope,el,attr){
        scope.$emit("getConfigScope", function(configScope){
          scope.answerAreaId = attr.answerAreaId;
          scope.correctAnswers = configScope.correctAnswers;

          scope.targetSortableOptions = {
            start: function() {
              configScope.targetDragging = true;
            },
            stop: function() {
              configScope.targetDragging = false;
            }
          };

          scope.droppableOptions = {
            accept: function() {
              return !configScope.targetDragging;
            },
            distance: 5,
            hoverClass: 'answer-area-inline-hover',
            tolerance: "pointer"
          };

          scope.trackId = function(choice){
            return _.uniqueId();
          };

          scope.removeCorrectAnswer = function(index){
            scope.$emit("removeCorrectAnswer", scope.answerAreaId, index);
          };
        });
      },
      template: [
        '<div class="answer-area-inline">',
        '  <ul class="sorted-choices draggable-choices" ui-sortable="targetSortableOptions" ng-model="correctAnswers[answerAreaId]"',
        '    data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
        '    <li class="sortable-choice" data-choice-id="{{choiceId}}" ng-repeat="choice in correctAnswers[answerAreaId] track by trackId(choice)">',
        '      <div class="delete-icon">',
        '        <i ng-click="removeCorrectAnswer($index)" class="fa fa-times-circle"></i>',
        '      </div>',
        '      <span ng-bind-html-unsafe="choice.label"></span>',
        '    </li>',
        '    <p class="prompt" ng-hide="correctAnswers[answerAreaId].length">',
        '      Drag correct answers here.',
        '    </p>',
        '  </ul>',
        '</div>'
      ].join("\n")
    };
  }
];
exports.framework = 'angular';
exports.directives = [{
  directive: main
}, {
  name: 'csConfigAnswerAreaInlineV201',
  directive: csConfigAnswerAreaInline
}];