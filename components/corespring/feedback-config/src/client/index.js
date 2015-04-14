// module: corespring.choice-templates
// service: FeedbackConfig
/* global exports */
exports.framework = "angular";
exports.service = [
  'LogFactory',
  'MiniWiggiScopeExtension',
  'ServerLogic',
  function(LogFactory, MiniWiggiScopeExtension, ServerLogic) {

    "use strict";

    function FeedbackConfig() {

      this.extendScope = function(scope, componentType) {
        new MiniWiggiScopeExtension().postLink(scope);

        var server = ServerLogic.load(componentType);
        scope.defaultCorrectFeedback = server.keys.DEFAULT_CORRECT_FEEDBACK;
        scope.defaultIncorrectFeedback = server.keys.DEFAULT_INCORRECT_FEEDBACK;
        scope.defaultPartialFeedback = server.keys.DEFAULT_PARTIAL_FEEDBACK;
        scope.defaultNotChosenFeedback = server.keys.DEFAULT_NOT_CHOSEN_FEEDBACK;
        scope.defaultSubmittedFeedback = server.keys.DEFAULT_SUBMITTED_FEEDBACK;
      };

      this.feedbackConfigPanel = function() {
        return [
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
        ].join('');
      };
    }

    return new FeedbackConfig();
  }
];