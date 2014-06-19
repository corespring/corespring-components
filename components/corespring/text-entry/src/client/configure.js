var main = [
  '$log',
  '$timeout',
  'MiniWiggiScopeExtension',
  function($log, $timeout, MiniWiggiScopeExtension) {

    "use strict";

    var designPanel = [
      '<div navigator-panel="Design">',
      '  <div class="cs-text-entry-cfg">',
      '    <div class="input-holder">',
      '      <div class="body">',
      '        <p class="info">',
      '          In Short Answer, students will respond to a prompt (e.g., calculate, identify, compute), and the',
      '          answer will be evaluated.',
      '        </p>',
      '        <div class="section-header">Correct Answers</div>',
      '        <p class="info field-info">',
      '          Use the tab key or the Enter/Return key for each possible word, phrase, expression, or equation.',
      '        </p>',
      '        <div class="cs-text-entry-cfg__answers-holder">',
      '          <div cs-response-input model="fullModel.correctResponses" prompt="correctResponsesPrompt"/>',
      '        </div>',
      '        <div class="section-header">Partially Correct Answers (optional)</div>',
      '        <p class="info field-info">',
      '          Use the tab key or the Enter/Return key for each possible word, phrase, expression, or equation.',
      '        </p>',
      '        <div class="cs-text-entry-cfg__answers-holder">',
      '          <div cs-response-input model="fullModel.partialResponses" prompt="partialResponsesPrompt"/>',
      '          <div class="cs-text-entry-cfg__award-config">Award',
      '            <input class="cs-text-entry-cfg__number-input" type="number"',
      '                   ng-model="fullModel.partialResponses.award" min="0" max="100"/> % of full credit for a partially',
      '            correct answer',
      '          </div>',
      '        </div>',
      '        <div ng-click="feedbackOn = !feedbackOn" style="margin-top: 10px"><i',
      '          class="fa fa-{{feedbackOn ? \'minus\' : \'plus\'}}-square-o"></i><span',
      '          style="margin-left: 3px">Feedback</span>',
      '        </div>',
      '        <div ng-show="feedbackOn">',
      '          <div class="well">',
      '            <div feedback-selector',
      '                 fb-sel-label="If correct, show"',
      '                 fb-sel-class="correct"',
      '                 fb-sel-feedback-type="fullModel.correctResponses.feedback.type"',
      '                 fb-sel-custom-feedback="fullModel.correctResponses.feedback.custom"',
      '                 fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '              ></div>',
      '          </div>',
      '          <div class="well">',
      '            <div feedback-selector',
      '                 fb-sel-label="If partially correct, show"',
      '                 fb-sel-class="partial"',
      '                 fb-sel-feedback-type="fullModel.partialResponses.feedback.type"',
      '                 fb-sel-custom-feedback="fullModel.partialResponses.feedback.custom"',
      '                 fb-sel-default-feedback="{{defaultPartialFeedback}}"',
      '              ></div>',
      '          </div>',
      '          <div class="well">',
      '            <div feedback-selector',
      '                 fb-sel-label="If incorrect, show"',
      '                 fb-sel-class="incorrect"',
      '                 fb-sel-feedback-type="fullModel.incorrectResponses.feedback.type"',
      '                 fb-sel-custom-feedback="fullModel.incorrectResponses.feedback.custom"',
      '                 fb-sel-default-feedback="{{defaultIncorrectFeedback}}"',
      '              ></div>',
      '          </div>',
      '        </div>',
      '        <div summary-feedback-input ng-model="fullModel.comments"></div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    var displayPanel = [
      '<div navigator-panel="Display">',
      '  <div class="cs-text-entry-cfg">',
      '    <div class="input-holder">',
      '      <div class="body">',
      '        <label>Answer blank size:</label>',
      '        <div class="answer-blank-size-input" ng-repeat="o in answerBlankSizeDataProvider">',
      '          <input type="radio" value="{{o.size}}" ng-model="fullModel.model.answerBlankSize"/>',
      '          <input type="text" readonly value="{{o.demoLabel}}" size="{{o.size}}"/> {{o.defaultLabel}}',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="input-holder">',
      '      <div class="body">',
      '        <label>Align text in answer blank:</label>',
      '        <select ng-model="fullModel.model.answerAlignment">',
      '          <option value="left">Left</option>',
      '          <option value="center">Center</option>',
      '          <option value="right">Right</option>',
      '        </select>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    var panels = [
      '<div>',
      '  <div navigator="">',
      designPanel,
      displayPanel,
      '  </div>',
      '</div>'
    ].join("\n");

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
      template: panels,
      link: function(scope, element, attrs) {

        new MiniWiggiScopeExtension().postLink(scope, element, attrs);

        scope.itemId = attrs.id;

        scope.correctResponsesPrompt = "Type all the possible correct answers here";
        scope.partialResponsesPrompt = "Type all acceptable partially correct answers here";

        var correctAnswerPlaceholder = "<random selection from correct answers>";

        var defaultCorrectFeedback = "Correct!";
        var defaultPartialFeedback = "Very good, but an even better answer would have been " + correctAnswerPlaceholder + ".";
        var defaultIncorrectFeedback = "Good try, but the correct answer is " + correctAnswerPlaceholder + ".";

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
            setFeedbackValue(scope.fullModel.correctResponses.feedback, defaultCorrectFeedback);
            setFeedbackValue(scope.fullModel.partialResponses.feedback, defaultPartialFeedback);
            setFeedbackValue(scope.fullModel.incorrectResponses.feedback, defaultIncorrectFeedback);
            return scope.fullModel;
          }
        };

        scope.$watch('fullModel.correctResponses.values.length', function() {
          initFeedbacks();
        });

        scope.answerBlankSizeDataProvider = [{
          size: 3,
          demoLabel: "ABC",
          defaultLabel: ""
        }, {
          size: 5 + 1,
          demoLabel: "ABCDE",
          defaultLabel: ""
        }, {
          size: 7 + 1,
          demoLabel: "ABCDEFG",
          defaultLabel: "(Default)"
        }, {
          size: 10 + 1,
          demoLabel: "ABCDEFGHIJ",
          defaultLabel: ""
        }];

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
            template = template.replace(correctAnswerPlaceholder, correctAnswer);
          }
          return template;
        }

        function randomCorrectAnswer() {
          var result = scope.fullModel.correctResponses ? _.sample(scope.fullModel.correctResponses.values) : "";
          return result;
        }

        // Workaround for https://github.com/ivaynberg/select2/issues/291
        $timeout(function() {
          $('.select2-search-field input', element).each(function(i, el) {
            el.focus();
            el.blur();
          });
        }, 200);

      }
    };
  }
];

var csResponseInput = [
  '$log',
  function($log) {

    "use strict";

    var template = [
      '<div class="cs-text-entry-cfg__responses-input">',
      '  <input style="width:100%;" type="text" ng-model="response.values"',
      '         ui-select2="select2Options"',
      '         data-placeholder="{{prompt}}"',
      '    />',
      '  <div class="pull-right">',
      '    <label class="checkbox-inline">',
      '      <input type="checkbox" value="ignore-case" ng-init="response.caseSensitive = !response.ignoreCase"',
      '             ng-model="response.caseSensitive" ng-change="response.ignoreCase = !response.caseSensitive"/>Case sensitive?',
      '    </label>',
      '    <label class="checkbox-inline">',
      '      <input type="checkbox" value="ignore-whitespace" ng-model="response.ignoreWhitespace"/>Ignore spacing?',
      '    </label>',
      '  </div>',
      '  <div class="clearfix"></div>',
      '</div>'
    ].join("\n");

    return {
      scope: {
        response: '=model',
        prompt: '=prompt'
      },
      restrict: 'A',
      replace: true,
      template: template,
      controller: function($scope) {
        //it is important to set the options in the controller
        //because the link function is executed too late
        $scope.select2Options = {
          tags: [],
          simple_tags: true,
          multiple: true,
          dropdownCssClass: 'cs-text-entry-cfg__responses-input--dropdown-noshow',
          tokenSeparators: [',']
        };
      },
      link: function(scope, element, attrs) {}
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
