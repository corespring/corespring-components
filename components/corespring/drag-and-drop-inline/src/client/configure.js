/* globals console, exports */

var main = [
  "ChoiceTemplates",
  "ComponentImageService",
  "WiggiLinkFeatureDef",
  "WiggiMathJaxFeatureDef",
  function(ChoiceTemplates, ComponentImageService, WiggiLinkFeatureDef, WiggiMathJaxFeatureDef) {

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

        $scope.extraFeaturesForAnswerAreas = {
          definitions: [
            new WiggiMathJaxFeatureDef(),
            new WiggiLinkFeatureDef(),
            {
              name: 'answer-area-inline',
              draggable: false,
              compile: true,
              addToEditor: function(editor, addContent) {
                var id = $scope.addAnswerArea();
                addContent($('<answer-area-inline id="' + id +'"/>'));
              },
              initialise: function($node, replaceWith) {
                var id = $node.attr('id');
                return replaceWith($('<div cs-config-answer-area-inline answer-area-id="' + id + '"/>'));
              },
              onDblClick: function($node, $scope, editor) {
              },
              editInstance: function($node, $scope, editor) {
              },
              getMarkUp: function($node) {
                var id = $node.attr('answer-area-id');
                return '<answer-area-inline id="' + id +'"/>';
              }
            }]
        };
      }],
      link: function(scope, element, attrs) {

        ChoiceTemplates.extendScope(scope, 'corespring-drag-and-drop-inline');

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
              return _.find(model.model.choices, function(c) {
                return c.id === cid;
              });
            }

            _.each(model.correctResponse, function(val, key) {
              scope.correctAnswers[key] = _.map(val, function(choiceId) {
                return choiceById(choiceId);
              });
            });

            scope.updatePartialScoringModel(sumCorrectAnswers());

            scope.componentState = "initialized";
            console.log(model);
          },
          getModel: function() {
            var model = _.cloneDeep(scope.fullModel);
            return model;
          },
          getAnswer: function() {
            console.log("returning empty answer for: Drag and drop inline");
            return {};
          }
        };

        scope.$watch('correctAnswers', function(n) {
          if (n) {
            _.each(scope.correctAnswers, function(val, key) {
              scope.fullModel.correctResponse[key] = _.pluck(val, 'id');
            });
            scope.updatePartialScoringModel(sumCorrectAnswers());
          }
        }, true);

        scope.removeChoice = function(c) {
          scope.model.choices = _.filter(scope.model.choices, function(existing) {
            return existing !== c;
          });
          _.each(scope.correctAnswers, function(val, key) {
            scope.correctAnswers[key] = _.filter(val, function(choice){
              return choice !== c;
            });
          });
        };

        function findFreeChoiceSlot(){
          var slot = 0;
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

        scope.removeAnswerArea = function(answerArea) {
          scope.model.answerAreas = _.filter(scope.model.answerAreas, function(existing) {
            return existing !== answerArea;
          });
          delete scope.correctAnswers[answerArea.id];
        };

        function findFreeAnswerAreaSlot(){
          var slot = 0;
          var ids = _.pluck(scope.model.answerAreas, 'id');
          while(_.contains(ids, "aa_" + slot)){
            slot++;
          }
          return slot;
        }

        scope.addAnswerArea = function() {
          var idx = findFreeAnswerAreaSlot();
          scope.model.answerAreas.push({
            id: "aa_" + idx
          });
        };

        scope.$on('getConfigScope', function(event, callback){
          console.log("on getConfigScope");
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
                return $('<div class="corespring-drag-and-drop-inline-drag-helper">' + choice.label + '</div>');
              }
          };
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
        '</div>',
      ].join('\n');

      var answerAreas = [
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <label class="control-label" style="margin-bottom: 10px;">Problem Area</label>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <div id="answerAreasWiggi" mini-wiggi-wiz=""',
        '      ng-model="model.answerAreasXhtml"',
        '      dialog-launcher="external"',
        '      features="extraFeaturesForAnswerAreas"',
        '      parent-selector=".modal-body"',
        '      image-service="imageService()">',
        '    </div>',
        '  </div>',
        '</div>',
      ].join("\n");

      var choices = [
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <label class="control-label" style="margin-bottom: 10px;">Choices</label>',
        '  </div>',
        '</div>',
        '<div class="choice-row" ng-repeat="choice in model.choices">',
        '  <div class="row">',
        '    <div class="col-xs-1 text-center">',
        '      <i class="fa fa-trash-o fa-lg remove-choice" ng-hide="model.choices.length == 1" title="Delete"',
        '          data-tggle="tooltip" ng-click="removeChoice(choice)">',
        '      </i>',
        '    </div>',
        '    <div class="col-xs-10" data-choice-id="choice.id" data-drag="true"',
        '         data-jqyoui-options="choiceDraggableJqueryOptions(choice)"',
        '         ng-model="choice"',
        '         jqyoui-draggable="choiceDraggableOptions($index)">',
        '      <div mini-wiggi-wiz="" dialog-launcher="external" ng-model="choice.label" placeholder="Enter a choice"',
        '          image-service="imageService()" features="extraFeatures" feature-overrides="overrideFeatures"',
        '          parent-selector=".modal-body">',
        '        <edit-pane-toolbar alignment="bottom">',
        '          <div class="btn-group pull-right">',
        '            <button ng-click="closePane()" class="btn btn-sm btn-success">Done</button>',
        '          </div>',
        '        </edit-pane-toolbar>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="row" style="margin-bottom: 20px;">',
        '    <div class="col-xs-offset-1 col-xs-12">',
        '      <checkbox ng-model="choice.removeAfterPlacing">Remove tile after placing</checkbox>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-offset-1 col-xs-12">',
        '    <button type="button" class="btn btn-default add-choice"',
        '        ng-click="addChoice()">Add a Choice</button>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-offset-1 col-xs-12">',
        '    <checkbox class="shuffle-choices" ng-model="model.config.shuffle">Shuffle Choices</checkbox>',
        '  </div>',
        '</div>',
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
        '<div class="container-fluid">',
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

      var displayOptions = [
        '<div class="container-fluid">',
        '  <div class="row">',
        '    <div class="col-xs-12">',
        '      <form class="form-horizontal" role="form">',
        '        <div class="config-form-row">',
        '          <div class="col-sm-5" ng-show="model.config.choiceAreaHasLabel">',
        '            <input type="text" class="form-control" ng-model="model.config.choiceAreaLabel" />',
        '          </div>',
        '        </div>',
        '        <div class="config-form-row"><label>Layout</label></div>',
        '        <div class="config-form-row layout-config">',
        '          <div class="col-sm-2">',
        '            <radio id="vertical" value="vertical"',
        '                ng-model="model.config.choiceAreaLayout">Vertical</radio>',
        '          </div>',
        '          <div class="col-sm-2">',
        '            <radio id="horizontal" value="horizontal"',
        '                ng-model="model.config.choiceAreaLayout">Horizontal</radio>',
        '          </div>',
        '        </div>',
        '        <div class="config-form-row">',
        '          <label>Choice area is </label>',
        '          <select class="form-control choice-area" ng-model="model.config.choiceAreaPosition"',
        '              ng-options="c for c in [\'above\', \'below\']">',
        '          </select>',
        '          <label>answer blanks</label>',
        '        </div>',
        '      </form>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');

      var result = [
        '<div class="drag-and-drop-config-panel drag-and-drop-inline-config-panel" choice-template-controller="">',
        '  <div navigator-panel="Design">',
        designOptions,
        '  </div>',
        '  <div navigator-panel="Scoring">',
        scoringOptions,
        '  </div>',
        '  <div navigator-panel="Display">',
        displayOptions,
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
        console.log("link", attr.answerAreaId);
        scope.$emit("getConfigScope", function(configScope){

          console.log("getConfigScope callback", configScope);
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
            }
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
        '    <p class="prompt">',
        '      Drag and order correct answers here.',
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
  name: 'csConfigAnswerAreaInline',
  directive: csConfigAnswerAreaInline
}];