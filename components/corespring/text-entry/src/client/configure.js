var main = [
  '$log',
  function($log) {

    "use strict";

    function createResponsesModel(award) {
      return {
        values: [],
        award: award,
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
      templateUrl: "/client/libs/corespring/text-entry/templates/design-panel.html",
      link: function(scope, element, attrs) {

        scope.itemId = attrs.id;

        scope.correctResponsesPrompt = "Type all the possible correct answers here";
        scope.partialResponsesPrompt = "Type all acceptable partially correct answers here";

        var defaultCorrectFeedback = "Correct!";
        var defaultPartialFeedback = "Very good, but an even better answer would have been <random selection from correct answers>.";
        var defaultIncorrectFeedback = "Good try, but the correct answer is <random selection from correct answers>.";

        scope.containerBridge = {
          setModel: function(fullModel) {
            fullModel.correctResponses = fullModel.correctResponses || createResponsesModel(100);
            fullModel.partialResponses = fullModel.partialResponses || createResponsesModel(25);
            fullModel.incorrectResponses = fullModel.incorrectResponses || createResponsesModel(0);
            scope.fullModel = fullModel;
          },

          getModel: function() {
            setFeedbackValue(scope.fullModel.correctResponses.feedback, defaultCorrectFeedback);
            setFeedbackValue(scope.fullModel.partialResponses.feedback, defaultPartialFeedback);
            setFeedbackValue(scope.fullModel.incorrectResponses.feedback, defaultIncorrectFeedback);
            return scope.fullModel;
          }
        };

        scope.$watch('fullModel.correctResponses.values.length', function() {
          initFeedbacks();
        });

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

        function initFeedbacks() {
          scope.defaultCorrectFeedback = replaceVariables(defaultCorrectFeedback);
          scope.defaultPartialFeedback = replaceVariables(defaultPartialFeedback);
          scope.defaultIncorrectFeedback = replaceVariables(defaultIncorrectFeedback);
        }

        function setFeedbackValue(feedback, defaultFeedback) {
          function getFeedbackValue(feedback) {
            switch (feedback.type) {
              case 'custom':
                return feedback.custom;
              case 'none':
                return "";
              default:
                return defaultFeedback;
            }
          }

          feedback.value = getFeedbackValue(feedback);
        }

        function replaceVariables(template) {
          var correctAnswer = randomCorrectAnswer();
          if (correctAnswer) {
            template = template.replace("<random selection from correct answers>", correctAnswer);
          }
          return template;
        }

        function randomCorrectAnswer() {
          var result = scope.fullModel.correctResponses ? _.sample(scope.fullModel.correctResponses.values) : "";
          return result;
        }

      }
    };
  }
];

var csResponseInput = [
  '$log',
  function($log) {

    "use strict";

    return {
      scope: {
        response: '=model',
        prompt: '=prompt'
      },
      restrict: 'A',
      replace: true,
      templateUrl: "/client/libs/corespring/text-entry/templates/response-input.html",
      link: function(scope, element, attrs) {

      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}, {
  name: 'csResponseInput',
  directive: csResponseInput
}];
