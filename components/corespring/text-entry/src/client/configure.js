/* global console, exports */

var main = [
  '$log',
  '$timeout',
  'MiniWiggiScopeExtension',
  function($log, $timeout, MiniWiggiScopeExtension) {

    "use strict";

    var designPanel = [
      '  <div class="container-fluid">',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <p>',
      '          In Short Answer &mdash; Enter Text, students will respond to a prompt (e.g., calculate, identify,',
      '          compute), and the answer will be evaluated.',
      '        </p>',
      '      </div>',
      '    </div>',
      '    <div class="row"><div class="col-xs-12"><label class="control-label">Correct Answers</label></div></div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <p>',
      '          Use the tab key or the Enter/Return key for each possible word, phrase, expression, or equation.',
      '        </p>',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <div cs-text-entry-response-input model="fullModel.correctResponses" prompt="correctResponsesPrompt"/>',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <label class="control-label">Partially Correct Answers (optional)</label>',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <p>',
      '          Use the tab key or the Enter/Return key for each possible word, phrase, expression, or equation.',
      '        </p>',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <div cs-text-entry-response-input model="fullModel.partialResponses" prompt="partialResponsesPrompt"/>',
      '      </div>',
      '    </div>',
      '    <div class="row award-row">',
      '      <div class="col-xs-12">',
      '        Award ',
      '        <input class="award-percent" type="number" ng-model="fullModel.partialResponses.award" min="0"',
      '            max="100"/> ',
      '        % of full credit for a partially correct answer',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <div feedback-panel>',
      '          <div feedback-selector',
      '              fb-sel-label="If correct, show"',
      '              fb-sel-class="correct"',
      '              fb-sel-feedback-type="fullModel.correctResponses.feedback.type"',
      '              fb-sel-custom-feedback="fullModel.correctResponses.feedback.custom"',
      '              fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
      '          </div>',
      '          <div feedback-selector',
      '              fb-sel-label="If partially correct, show"',
      '              fb-sel-class="partial"',
      '              fb-sel-feedback-type="fullModel.partialResponses.feedback.type"',
      '              fb-sel-custom-feedback="fullModel.partialResponses.feedback.custom"',
      '              fb-sel-default-feedback="{{defaultPartialFeedback}}">',
      '          </div>',
      '          <div feedback-selector',
      '              fb-sel-label="If incorrect, show"',
      '              fb-sel-class="incorrect"',
      '              fb-sel-feedback-type="fullModel.incorrectResponses.feedback.type"',
      '              fb-sel-custom-feedback="fullModel.incorrectResponses.feedback.custom"',
      '              fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>'
    ].join("\n");

    var displayPanel = [
      '  <div class="container-fluid">',
      '    <div class="row text-field-size-row">',
      '      <div class="col-xs-12">',
      '        <label class="control-label">Answer blank size</label>',
      '        <div ng-repeat="o in answerBlankSizeDataProvider">',
      '          <radio value="{{o.size}}" ng-model="fullModel.model.answerBlankSize">',
      '          <input type="text" readonly value="{{o.demoLabel}}" size="{{o.size}}"/> <span>{{o.defaultLabel}}</span>',
      '          </radio>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="row align-row">',
      '      <div class="col-xs-12">',
      '        <label class="control-label">Align text in answer blank:</label>',
      '        <select class="form-control" ng-model="fullModel.model.answerAlignment">',
      '          <option value="left">Left</option>',
      '          <option value="center">Center</option>',
      '          <option value="right">Right</option>',
      '        </select>',
      '      </div>',
      '    </div>',
      '  </div>'
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
      template: [
        '<div class="config-text-entry">',
        '  <div navigator="">',
        '    <div navigator-panel="Design">',
        designPanel,
        '    </div>',
        '    <div navigator-panel="Display">',
        displayPanel,
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n'),
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

var csTextEntryResponseInput = [
  '$log',
  function($log) {

    "use strict";

    var template = [
      '<div class="response-input">',
      '  <ui-select multiple tagging tagging-label="false" ng-model="model.values" theme="bootstrap"',
      '     ng-disabled="disabled" title="prompt" tagging-tokens="ENTER">',
      '    <ui-select-match placeholder="{{prompt}}">{{$item}}</ui-select-match>',
      '    <ui-select-choices repeat="c in model.values">{{c}}</ui-select-choices>',
      ' </ui-select>',
      '  <div class="pull-right">',
      '    <checkbox value="ignore-case" ng-init="model.caseSensitive = !model.ignoreCase"',
      '             ng-model="model.caseSensitive" ng-change="model.ignoreCase = !model.caseSensitive">',
      '      Case sensitive?',
      '    </checkbox>',
      '  </div>',
      '  <div class="pull-right">',
      '    <checkbox value="ignore-whitespace" ng-model="model.ignoreWhitespace">Ignore spacing?</checkbox>',
      '  </div>',
      '  <div class="clearfix"></div>',
      '</div>'
    ].join("\n");

    return {
      scope: {
        model: '=model',
        prompt: '=prompt'
      },
      restrict: 'A',
      replace: true,
      template: template
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}, {
  name: 'csTextEntryResponseInput',
  directive: csTextEntryResponseInput
}];
