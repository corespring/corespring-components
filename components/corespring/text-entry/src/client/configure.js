var main = [
  '$log',
  function ($log) {

    function createCorrectResponseFeedbackModel() {
      return {
        type: "default"
      };
    }

    function createPartialResponseFeedbackModel() {
      return {
        type: "default"
      };
    }

    function createResponsesModel(responses, award) {
      return {
        values: responses.split(","),
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

        scope.correctResponsesPrompt = "Type all the possible correct answers here";
        scope.partialResponsesPrompt = "Type all acceptable partially correct answers here";

        scope.containerBridge = {
          setModel: function (fullModel) {
            fullModel.correctResponses = fullModel.correctResponses ||
              createResponsesModel("A,B,C", 100);
            fullModel.partialResponses = fullModel.partialResponses ||
              createResponsesModel("D,E,F", 25);

            fullModel.model = fullModel.model || {};
            fullModel.model.config = fullModel.model.config || {};

            fullModel.model.config.correctResponses = fullModel.model.config.correctResponses || {};
            fullModel.model.config.correctResponses.feedback =
              _.extend({}, createCorrectResponseFeedbackModel(), fullModel.model.config.correctResponses.feedback || {});

            fullModel.model.config.partialResponses = fullModel.model.config.partialResponses || {};
            fullModel.model.config.partialResponses.feedback =
              _.extend({}, createPartialResponseFeedbackModel(), fullModel.model.config.partialResponses.feedback || {});

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
        feedback: '=model',
        type: '=type'
      },
      restrict: 'A',
      replace: true,
      templateUrl: "/client/libs/corespring/text-entry/templates/feedback-input.html",
      link: function (scope, element, attrs) {

        var feedbackConfig = {
          none: {
            value: "",
            prompt: "No information will be shown.",
            tooltip: "Select 'Default' or 'Custom' to show feedback.",
            readonly: true
          },
          correct: {
            value: "Correct!",
            prompt: "",
            tooltip: "Select 'No' to disable or 'Custom' to show customized feedback.",
            readonly: true
          },
          partial: {
            value: "Good try but the correct answer is <random selection from correct answers>",
            prompt: "",
            tooltip: "Select 'No' to disable or 'Custom' to show customized feedback.",
            readonly: true
          },
          custom: {
            value: "",
            prompt: "Enter your customized feedback.",
            tooltip: "Select 'No' to disable or 'Default' to show the default feedback.",
            readonly: false
          }
        };

        var feedbackInputConfig = {
          correct : {
            title: "Feedback",
            headline: "If correct, show"
          },
          partial : {
            title: "If incorrect",
            headline: "If incorrect or partially correct, show"
          }
        };

        function getFeedbackConfig(type) {
          return {
            "none": feedbackConfig.none,
            "default": feedbackConfig[type],
            "custom": feedbackConfig.custom
          };
        }

        function getFeedbackTitle(type) {
          return feedbackInputConfig.hasOwnProperty(type) ? feedbackInputConfig[type].title : "Unexpected type <" + type + ">";
        }

        function getFeedbackHeadline(type) {
          return feedbackInputConfig.hasOwnProperty(type) ? feedbackInputConfig[type].headline : "Unexpected type <" + type + ">";
        }

        scope.config = getFeedbackConfig(attrs.type);
        scope.title = getFeedbackTitle(attrs.type);
        scope.headline = getFeedbackHeadline(attrs.type);

        function initFeedbackForType(newType, oldType) {
          //The initFeedbackForType function is called in two different situations
          //1. When the feedback model is assigned during initialisation
          //2. When the user changed the feedback type
          //During initialisation we either get default values or values from db
          //If the data comes from db and the feedback type is custom, we don't want to overwrite
          //this value with the default value. That is why the value is reassigned here
          //after the defaults have been set.
          var valueToKeep = "";
          if(newType === 'custom' && newType === oldType){
            valueToKeep = scope.feedback.value;
          }
          _.extend(scope.feedback, scope.config[newType]);
          if(valueToKeep){
            scope.feedback.value = valueToKeep;
          }
        }

        scope.$watch('feedback.type', function (newType, oldType) {
          initFeedbackForType(newType, oldType);
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
        response: '=model',
        prompt: '=prompt'
      },
      restrict: 'A',
      replace: true,
      templateUrl: "/client/libs/corespring/text-entry/templates/response-input.html",
      link: function (scope, element, attrs) {

      }
    };
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
