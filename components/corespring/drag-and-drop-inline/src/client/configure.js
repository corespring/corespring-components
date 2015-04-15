/* globals console, exports */

var main = [
  "$compile",
  "$timeout",
  "ChoiceTemplates",
  "ComponentImageService",
  "WiggiLinkFeatureDef",
  "WiggiMathJaxFeatureDef",
  function($compile, $timeout, ChoiceTemplates, ComponentImageService, WiggiLinkFeatureDef, WiggiMathJaxFeatureDef) {

    "use strict";

    return {
      restrict: "E",
      scope: {},
      replace: true,
      template: template(),

      controller: ['$scope', function($scope) {
        $scope.imageService = function() {
          return ComponentImageService;
        };

        $scope.extraFeaturesForChoices = {
          definitions: [
            new WiggiMathJaxFeatureDef()
          ]
        };

          $scope.extraFeaturesForAnswerArea = {
              definitions: [
                  new WiggiMathJaxFeatureDef(),
                  new WiggiLinkFeatureDef(),
                  {
                      name: 'answer-area-inline-csdndi',
                      title: 'Add Answer Blank',
                      draggable: false,
                      compile: true,
                      addToEditor: function(editor, addContent) {
                          var id = $scope.addAnswerArea();
                          addContent($('<answer-area-inline-csdndi id="' + id + '"/>'));
                      },
                      deleteNode: function($node, services) {
                          var id = $node.attr('answer-area-id');
                          $scope.removeAnswerArea(id);
                      },
                      initialise: function($node, replaceWith) {
                          var id = $node.attr('id');
                          return replaceWith($('<div config-answer-area-inline-csdndi answer-area-id="' + id + '"/>'));
                      },
                      onDblClick: function($node, $scope, editor) {},
                      editInstance: function($node, $scope, editor) {},
                      getMarkUp: function($node) {
                          var id = $node.attr('answer-area-id');
                          return '<answer-area-inline-csdndi id="' + id + '"/>';
                      }
                  }]
          };
      }],

      link: function(scope, element, attrs) {

        ChoiceTemplates.extendScope(scope, 'corespring-drag-and-drop-inline');

        scope.correctAnswers = {};

        function sumCorrectAnswers() {
          return _.reduce(scope.correctAnswers, function(memo, ca) {
            return ca.length + memo;
          }, 0);
        }

        function choiceById(choices, cid) {
          return _.find(choices, {
            id: cid
          });
        }

        function removeChoice(choices, id) {
          _.remove(choices, {
            id: id
          });
        }

        function idsToChoices(ids) {
          return _.map(ids, function(choiceId) {
            return choiceById(scope.model.choices, choiceId);
          });
        }

        function isPlaced(choice) {
          return _.some(scope.correctAnswers, function(val, key) {
            return !_.isUndefined(_.find(val, {
              id: choice.id
            }));
          });
        }

        function initCorrectAnswers(answerAreas, correctResponse) {
          var correctAnswers = {};
          _.each(answerAreas, function(area) {
            correctAnswers[area.id] = [];
          });
          _.each(correctResponse, function(correctChoices, areaId) {
            correctAnswers[areaId] = idsToChoices(correctChoices);
          });
          return correctAnswers;
        }

        function correctAnswersToCorrectResponse(correctAnswers) {
          var correctResponse = {};
          _.each(correctAnswers, function(val, key) {
            correctResponse[key] = _.pluck(val, 'id');
          });
          return correctResponse;
        }

        scope.containerBridge = {
          setModel: function(fullModel) {
            scope.fullModel = fullModel;
            scope.model = fullModel.model;
            scope.correctAnswers = initCorrectAnswers(fullModel.model.answerAreas, fullModel.correctResponse);
            scope.updateNumberOfCorrectResponses(sumCorrectAnswers());
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

        scope.$watch('correctAnswers', function(newCorrectAnswers) {
          if (newCorrectAnswers) {
            scope.fullModel.correctResponse = correctAnswersToCorrectResponse(newCorrectAnswers);
            scope.updateNumberOfCorrectResponses(sumCorrectAnswers());
          }
        }, true);

        scope.removeChoice = function(id) {
          removeChoice(scope.model.choices, id);
          _.each(scope.correctAnswers, function(choices, key) {
            removeChoice(choices, id);
          });
        };

        function findFreeSlot(ids, prefix) {
          var slot = 1;
          while (_.contains(ids, prefix + slot)) {
            slot++;
          }
          return prefix + slot;
        }

        function findFreeChoiceSlot() {
          return findFreeSlot(_.pluck(scope.model.choices, 'id'), 'c_');
        }

        scope.addChoice = function() {
          scope.model.choices.push({
            id: findFreeChoiceSlot(),
            labelType: "text",
            label: "",
            moveOnDrag: false
          });
        };

        function findFreeAnswerAreaSlot() {
          return findFreeSlot(_.pluck(scope.model.answerAreas, 'id'), "aa_");
        }

        scope.addAnswerArea = function() {
          var answerAreaId = findFreeAnswerAreaSlot();
          scope.model.answerAreas.push({
            id: answerAreaId
          });
          scope.correctAnswers[answerAreaId] = [];
          return answerAreaId;
        };

        scope.removeAnswerArea = function(answerAreaId) {
          _.remove(scope.model.answerAreas, {
            id: answerAreaId
          });
          delete scope.correctAnswers[answerAreaId];
        };

        scope.$on('get-config-scope', function(event, callback) {
          callback(scope);
        });

        scope.$on('remove-correct-answer', function(event, answerAreaId, index) {
          scope.correctAnswers[answerAreaId].splice(index, 1);
        });

        scope.choiceDraggableOptions = function(index) {
          return {
            index: index,
            placeholder: 'keep'
          };
        };

        function dragHelperTemplate(choice) {
          var $choice = $('li.draggable-choice[data-choice-id="' + choice.id + '"]');
          var $content = $choice.find(".content-holder");
          return [
            '<div class="drag-helper-csdndi">',
            $content[0].innerHTML,
            '</div>'
          ].join('');
        }

        scope.choiceDraggableJqueryOptions = function(choice) {
          return {
            revert: 'invalid',
            helper: function() {
              return $(dragHelperTemplate(choice));
            },
            appendTo: ".modal",
            cursorAt: {
              bottom: 10,
              right: 10
            },
            distance: 15

          };
        };

        scope.active = [];

        scope.activate = function($event, $index) {
          $event.stopPropagation();
          scope.active = [];
          scope.active[$index] = true;
        };

        scope.itemClick = function($event) {
          function isChoiceEditor($event) {
            return $($event.target).parents('.mini-wiggi-wiz').length !== 0;
          }

          if (isChoiceEditor($event)) {
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

        scope.canDragChoice = function(choice, index) {
          return !(scope.active[index] || choice.moveOnDrag === true && isPlaced(choice));
        };

        scope.cleanLabel = (function() {
          var wiggiCleanerRe = new RegExp(String.fromCharCode(8203), 'g');
          return function(choice) {
            return (choice.label || '').replace(wiggiCleanerRe, '');
          };
        })();

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      }
    };

    function template() {
      function introduction() {
        return [
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <p>',
          '      In Short Answer &mdash; Drag and Drop, students are asked to complete a sentence, word, phrase or',
          '      equation using context clues presented in the text that surrounds it.',
          '    </p>',
          '    <p><i>',
          '      The "Remove tile after placing" option removes the answer from the choice area after a student places ',
          '      it in an answer area. <br>If you select this option on a choice, you may not add it to more than one ',
          '      answer blank.',
          '    </i></p>',
          '  </div>',
          '</div>'
        ].join('\n');
      }

      function answerAreas() {
        return [
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <label class="control-label" style="margin-bottom: 10px;">Problem Area</label>',
          '    <p class="answer-area-help-text">Begin typing and click "Add Answer Blank" to insert an answer blank. Drag the correct answer(s) to the blank(s).</p>',
          '  </div>',
          '</div>',
          '<div class="row">',
          '  <div class="col-xs-12">',
          '    <div id="answerAreaWiggi"',
          '      class="answer-area-wiggi"',
          '      locked-active-state="true"',
          '      mini-wiggi-wiz=""',
          '      ng-model="model.answerAreaXhtml"',
          '      dialog-launcher="external"',
          '      features="extraFeaturesForAnswerArea"',
          '      parent-selector=".modal-body"',
          '      image-service="imageService()">',
          '    </div>',
          '  </div>',
          '</div>'
        ].join("\n");
      }

      function choices() {
        return [
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
          '          ng-model="choice" ng-click="itemClick($event)" data-drag="{{canDragChoice(choice, $index)}}"',
          '          jqyoui-draggable="choiceDraggableOptions($index)"',
          '          data-jqyoui-options="choiceDraggableJqueryOptions(choice)">',
          '        <div class="blocker" ng-click="activate($event, $index)" ng-hide="active[$index]">',
          '          <div class="bg"></div>',
          '          <div class="content">',
          '            <ul class="edit-controls">',
          '              <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true"',
          '                  tooltip-placement="bottom" ng-click="activate($event, $index)">',
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
          '          <checkbox id="moveOnDrag{{$index}}" ng-model="choice.moveOnDrag">',
          '            Remove tile after placing',
          '          </checkbox>',
          '        </div>',
          '        <span class="content-holder" ng-hide="active[$index]" ng-bind-html-unsafe="cleanLabel(choice)"></span>',
          '        <div ng-show="active[$index]"',
          '            active="active[$index]"',
          '            mini-wiggi-wiz=""',
          '            ng-model="choice.label"',
          '            dialog-launcher="external"',
          '            features="extraFeaturesForChoices"',
          '            parent-selector=".modal-body"',
          '            image-service="imageService()">',
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
      }

      function feedback() {
        return [
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
      }

      function designOptions() {
        return [
          '<div class="container-fluid" ng-click="deactivate()">',
          introduction(),
          '  <div class="row choices-and-answers">',
          '    <div class="col-xs-6">',
          choices(),
          '    </div>',
          '    <div class="col-xs-6">',
          answerAreas(),
          '    </div>',
          '  </div>',
          feedback(),
          '</div>'
        ].join('\n');
      }

      function scoringOptions() {
        return [
          '<div class="container-fluid">',
          '  <div class="row">',
          '    <div class="col-xs-12">',
          ChoiceTemplates.scoring(),
          '    </div>',
          '  </div>',
          '</div>'
        ].join('\n');
      }

      return [
        '<div class="config-csdndi" choice-template-controller="">',
        '  <div navigator-panel="Design">',
        designOptions(),
        '  </div>',
        '  <div navigator-panel="Scoring">',
        scoringOptions(),
        '  </div>',
        '</div>'
      ].join('\n');
    }
  }
];

var configAnswerAreaInline = [
  '$log',
  'WIGGI_EVENTS',
  function($log, WIGGI_EVENTS) {
    "use strict";
    return {
      scope: {},
      restrict: 'A',
      replace: true,
      link: function(scope, el, attr) {
        scope.$emit("get-config-scope", function(configScope) {
          scope.answerAreaId = attr.answerAreaId;
          scope.correctAnswers = configScope.correctAnswers;

          scope.targetSortableOptions = function() {
            return {
              disabled: configScope.correctAnswers[scope.answerAreaId].length === 0,
              distance: 5,
              start: function() {
                configScope.targetDragging = true;
              },
              stop: function() {
                configScope.targetDragging = false;
              }
            };
          };

          scope.droppableOptions = {
            accept: function() {
              return !configScope.targetDragging;
            },
            distance: 5,
            activeClass: 'answer-area-inline-active',
            hoverClass: 'answer-area-inline-hover',
            tolerance: "pointer"
          };

          scope.trackId = function(choice) {
            return _.uniqueId();
          };

          scope.removeCorrectAnswer = function(index) {
            scope.$emit("remove-correct-answer", scope.answerAreaId, index);
          };

          function removeTooltip() {
            scope.$broadcast("$destroy");
          }

          scope.removeAnswerArea = function() {
            removeTooltip();
            scope.$emit(WIGGI_EVENTS.DELETE_NODE, el);
            scope.$destroy();
          };

          scope.cleanLabel = configScope.cleanLabel;
        });
      },
      template: [
        '<div class="answer-area-inline">',
        '  <ul class="sortable-choices" ui-sortable="targetSortableOptions()" ng-model="correctAnswers[answerAreaId]"',
        '    data-drop="true" jqyoui-droppable="" data-jqyoui-options="droppableOptions">',
        '    <li class="sortable-choice" data-choice-id="{{choice.id}}" ng-repeat="choice in correctAnswers[answerAreaId] track by trackId(choice)">',
        '      <div class="delete-icon"',
        '        tooltip="remove choice" tooltip-append-to-body="true" tooltip-placement="bottom"' +
        '        ng-click="removeCorrectAnswer($index)">',
        '        <i class="fa fa-close"></i>',
        '      </div>',
        '      <span ng-bind-html-unsafe="cleanLabel(choice)"></span>',
        '    </li>',
        '    <p class="prompt" ng-hide="correctAnswers[answerAreaId].length">',
        '      Drag correct answers here.',
        '    </p>',
        '  </ul>',
        '  <div class="delete-answer-area-button"',
        '      ng-click="removeAnswerArea()">',
        '    <i class="fa fa-times-circle"',
        '      tooltip="delete answer blank" tooltip-append-to-body="true" tooltip-placement="bottom">',
        '    </i>',
        '  </div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}, {
  name: 'configAnswerAreaInlineCsdndi',
  directive: configAnswerAreaInline
}];