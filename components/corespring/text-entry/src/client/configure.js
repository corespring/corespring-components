var main = [
  '$log',
  function ($log) {

    function createResponsesModel(award) {
      return {
        values: [],
        award: award,
        ignoreCase: false,
        ignoreWhitespace: false,
        feedback: {type: "default"}
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
              createResponsesModel(100);
            fullModel.partialResponses = fullModel.partialResponses ||
              createResponsesModel(25);
            fullModel.incorrectResponses = fullModel.incorrectResponses ||
              createResponsesModel(0);
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
            prompt: "No feedback will be presented to the student.",
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
            value: "Partially correct!",
            prompt: "",
            tooltip: "Select 'No' to disable or 'Custom' to show customized feedback.",
            readonly: true
          },
          incorrect: {
            value: "Good try, but the correct answer is <random selection from correct answers>",
            prompt: "",
            tooltip: "Select 'No' to disable or 'Custom' to show customized feedback.",
            readonly: true
          },
          custom: {
            value: "",
            prompt: "Enter customized feedback to present to student.",
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
            title: "If partially correct",
            headline: "If submitted answer is partially correct, show"
          },
          incorrect : {
            title: "If incorrect",
            headline: "If submitted answer is incorrect, show"
          }
        };

        function getFeedbackConfig(correctness) {
          return {
            "none": feedbackConfig.none,
            "default": feedbackConfig[correctness],
            "custom": feedbackConfig.custom
          };
        }

        function getFeedbackTitle(correctness) {
          return feedbackInputConfig.hasOwnProperty(correctness) ? feedbackInputConfig[correctness].title : "Unexpected correctness <" + correctness + ">";
        }

        function getFeedbackHeadline(correctness) {
          return feedbackInputConfig.hasOwnProperty(correctness) ? feedbackInputConfig[correctness].headline : "Unexpected correctness <" + correctness + ">";
        }

        function initFeedbackForType(newType, oldType) {
          //The initFeedbackForType function is called in two different situations
          //1. When the feedback model is assigned during initialisation
          //2. When the user changes the feedback type by clicking one of the radio buttons
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

        function initInputStyleForType(type){
          if(type === 'none'){
            scope.inputStyle = ""
          } else {
            scope.inputStyle = attrs.correctness
          }
        }

        scope.config = getFeedbackConfig(attrs.correctness);
        scope.title = getFeedbackTitle(attrs.correctness);
        scope.headline = getFeedbackHeadline(attrs.correctness);

        scope.$watch('feedback.type', function (newType, oldType) {
          initFeedbackForType(newType, oldType);
          initInputStyleForType(newType);
        });

        scope.navClosed = false;
        scope.toggleNav = function() {
          scope.navClosed = !scope.navClosed;
        };

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
