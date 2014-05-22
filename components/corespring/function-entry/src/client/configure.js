var main = [
  '$log', 'ServerLogic',
  function($log, ServerLogic) {

    "use strict";

    var designPanel = [
      ' <div navigator-panel="Design">',
      '   <div class="cs-function-entry-cfg">',
      '     <div class="input-holder">',
      '       <div class="body">',
      '         <div class="section-header">Correct Answers</div>',
      '         <div class="cs-function-entry-cfg__answers-holder">',
      '           <input type="text" class="form-control" ng-model="fullModel.correctResponse.equation" />',
      '         </div>',
      '         <div class="cs-function-entry-cfg__answers-holder">',
      '           <input id="ignoreSpacing" type="checkbox" ng-model="fullModel.model.config.ignoreSpacing" />',
      '           <label for="ignoreSpacing">Ignore Spacing</label>',
      '         </div>',
      '         <div class="cs-function-entry-cfg__answers-holder">',
      '           <input id="showHelp" type="checkbox" ng-model="fullModel.model.config.showFormattingHelp" />',
      '           <label for="showHelp">Show student formatting help</label>',
      '         </div>',

      '         <div ng-click="feedbackOn = !feedbackOn" style="margin-top: 10px"><i',
      '           class="fa fa-{{feedbackOn ? \'minus\' : \'plus\'}}-square-o"></i><span',
      '           style="margin-left: 3px">Feedback</span>',
      '         </div>',
      '         <div ng-show="feedbackOn">',
      '           <div class="well">',
      '             <div feedback-selector',
      '                  fb-sel-label="If correct, show"',
      '                  fb-sel-class="correct"',
      '                  fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '                  fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '                  fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '               ></div>',
      '           </div>',
      '           <div class="well">',
      '             <div feedback-selector',
      '                  fb-sel-label="If incorrect, show"',
      '                  fb-sel-class="incorrect"',
      '                  fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '                  fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '                  fb-sel-default-feedback="{{defaultIncorrectFeedback}}"',
      '               ></div>',
      '           </div>',
      '         </div>',
      '         <div ng-click="commentOn = !commentOn" style="margin-top: 10px"><i',
      '           class="fa fa-{{commentOn ? \'minus\' : \'plus\'}}-square-o"></i><span style="margin-left: 3px">Summary Feedback (optional)</span>',
      '         </div>',
      '         <div ng-show="commentOn">',
      '           <textarea ng-model="fullModel.comments" class="form-control"',
      '                     placeholder="Use this space to provide summary level feedback for this interaction."></textarea>',
      '         </div>',
      '       </div>',
      '     </div>',
      '  </div>',
      '</div>'
    ].join("\n");


    var panels = [
      '<div>',
      '  <div navigator="">',
      designPanel,
      '  </div>',
      '</div>'
    ].join("\n");

    function createResponsesModel() {
      return {
        values: [],
        ignoreCase: false,
        ignoreWhitespace: false,
        feedback: {
          type: "default",
          custom: ""
        }
      };
    }

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      template: panels,
      link: function(scope, element, attrs) {

        var server = ServerLogic.load('corespring-function-entry');
        scope.defaultCorrectFeedback = server.DEFAULT_CORRECT_FEEDBACK;
        scope.defaultIncorrectFeedback = server.DEFAULT_INCORRECT_FEEDBACK;

        scope.containerBridge = {
          setModel: function(fullModel) {
            fullModel.correctResponses = fullModel.correctResponses || createResponsesModel(100);
            fullModel.partialResponses = fullModel.partialResponses || createResponsesModel(25);
            fullModel.incorrectResponses = fullModel.incorrectResponses || createResponsesModel(0);
            fullModel.model = fullModel.model || {};
            fullModel.model.answerBlankSize = fullModel.model.answerBlankSize || 8;
            fullModel.model.answerAlignment = fullModel.model.answerAlignment || 'left';
            scope.fullModel = fullModel;
          },

          getModel: function() {
            return scope.fullModel;
          }
        };

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

        function initFeedbacks() {
          scope.defaultCorrectFeedback = replaceVariables(defaultCorrectFeedback);
          scope.defaultPartialFeedback = replaceVariables(defaultPartialFeedback);
          scope.defaultIncorrectFeedback = replaceVariables(defaultIncorrectFeedback);
        }
      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
