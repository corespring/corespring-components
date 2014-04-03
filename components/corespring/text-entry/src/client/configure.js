var main = [
  '$log',
  function ($log) {

    var feedbackConfig = {
      none: {
        value: "",
        prompt: "No feedback is given.",
        tooltip: "Select 'Default' or 'Custom' to show feedback.",
        readonly: true
      },
      positive: {
        value: "Correct!",
        prompt: "",
        tooltip: "Select 'None' to disable or 'Custom' to show customized feedback.",
        readonly: true
      },
      negative: {
        value: "Try again!",
        prompt: "",
        tooltip: "Select 'None' to disable or 'Custom' to show customized feedback.",
        readonly: true
      },
      custom: {
        value: "",
        prompt: "Enter custom feedback.",
        tooltip: "Select 'None' to disable or 'Default' to show the default feedback.",
        readonly: false
      }
    };

    function getFeedbackConfig(type) {
      return {
        none: feedbackConfig.none,
        default: feedbackConfig[type],
        custom: feedbackConfig.custom
      }
    }

    function getCorrectResponseFeedbackModel() {
      return {
        type: "default",
        title: "Positive Feedback",
        headline: "If response is correct",
        config: getFeedbackConfig('positive')
      }
    }

    function getPartialResponseFeedbackModel() {
      return {
        type: "default",
        title: "Negative Feedback",
        headline: "If response is incorrect or partially correct",
        config: getFeedbackConfig('negative')
      };
    }

    function createResponsesModel(responses, award) {
      return {
        responses: responses.split(","),
        award: award,
        ignoreCase: true,
        ignoreWhitespace: true
      };
    }

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      templateUrl: "/client/libs/corespring/text-entry/templates/design-panel.html",
      link: function (scope, element, attrs) {

        scope.itemId = attrs.id;

        scope.containerBridge = {
          setModel: function (fullModel) {
            fullModel.correctResponses = fullModel.correctResponses ||
              createResponsesModel("A,B,C", 100);
            fullModel.partialResponses = fullModel.partialResponses ||
              createResponsesModel("D,E,F", 25);

            fullModel.model = fullModel.model || {};
            fullModel.model.config = fullModel.model.config || {};

            fullModel.model.config.correctResponse = fullModel.model.config.correctResponse || {};
            fullModel.model.config.correctResponse.feedback = fullModel.model.config.correctResponse.feedback ||
              getCorrectResponseFeedbackModel();

            fullModel.model.config.partialResponse = fullModel.model.config.partialResponse || {};
            fullModel.model.config.partialResponse.feedback = fullModel.model.config.partialResponse.feedback ||
              getPartialResponseFeedbackModel();

            scope.fullModel = fullModel;
          },

          getModel: function () {
            return scope.fullModel;
          }
        };

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      }
    };
  }
];

var csFeedbackInput = [
  function () {

    return {
      scope: {
        feedback: '=model'
      },
      restrict: 'A',
      replace: true,
      templateUrl: "/client/libs/corespring/text-entry/templates/feedback-input.html",
      link: function (scope, element, attrs) {

        function assignDefaults(destination, source){
          _.extend(destination, source);
        }

        function initFeedbackForType(newType){
          assignDefaults(scope.feedback, scope.feedback.config[newType]);
        }

        scope.$watch('feedback.type', function (newType) {
          initFeedbackForType(newType)
        });
      }
    };
  }
];

var csResponseInput = [
  '$log',
  function ($log) {

    return {
      scope: {
        response: '=model'
      },
      restrict: 'A',
      replace: true,
      templateUrl: "/client/libs/corespring/text-entry/templates/response-input.html",
      link: function (scope, element, attrs) {
      }
    }
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: 'csFeedbackInput',
    directive: csFeedbackInput
  },
  {
    name: 'csResponseInput',
    directive: csResponseInput
  }
];
