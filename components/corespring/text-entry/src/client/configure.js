/* global console, exports */
exports.framework = 'angular';
exports.directives = [
  {
    directive: [
      '$log',
      '$timeout',
      'MiniWiggiScopeExtension',
      configureTextEntry
    ]
  },
  {
    name: 'csTextEntryResponseInput',
    directive: [
      '$log',
      csTextEntryResponseInput
    ]
  }
];

function configureTextEntry(
  $log,
  $timeout,
  MiniWiggiScopeExtension
) {

  return {
    link: link,
    replace: true,
    restrict: 'E',
    scope: {},
    template: template()
  };


  function link(scope, element, attrs) {

    var correctAnswerPlaceholder = '<random selection from correct answers>';

    var defaultCorrectFeedback = 'Correct!';
    var defaultPartialFeedback = 'Very good, but an even better answer would have been ' + correctAnswerPlaceholder + '.';
    var defaultIncorrectFeedback = 'Good try, but the correct answer is ' + correctAnswerPlaceholder + '.';

    new MiniWiggiScopeExtension().postLink(scope, element, attrs);

    scope.itemId = attrs.id;

    scope.correctResponsesPrompt = 'Enter answers here';
    scope.partialResponsesPrompt = 'Enter answers here';

    scope.answerBlankSizeDataProvider = [{
      size: 3,
      demoLabel: 'ABC',
      defaultLabel: ''
    }, {
      size: 5 + 1,
      demoLabel: 'ABCDE',
      defaultLabel: ''
    }, {
      size: 7 + 1,
      demoLabel: 'ABCDEFG',
      defaultLabel: '(Default)'
    }, {
      size: 10 + 1,
      demoLabel: 'ABCDEFGHIJ',
      defaultLabel: ''
    }];

    scope.onBlurCorrectResponse = onBlurCorrectResponse;
    scope.onBlurPartialResponse = onBlurPartialResponse;

    scope.containerBridge = {
      setModel: setModel,
      getModel: getModel
    };

    $timeout(fixPlaceholderCutOff, 200);

    scope.$watch('editorModel.correctResponses.values.length', initFeedbacks);
    scope.$watch('editorModel', updateModel, true);

    scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

    scope.makeItBigEnough = function(n){
      return n + 2;
    };

    //-----------------------------------------------------------------

    function setModel(fullModel) {
      scope.fullModel = fullModel;

      var editorModel = _.cloneDeep(fullModel);
      editorModel.correctResponses = editorModel.correctResponses || createResponsesModel(100);
      editorModel.partialResponses = editorModel.partialResponses || createResponsesModel(0);
      editorModel.incorrectResponses = editorModel.incorrectResponses || createResponsesModel(0);
      editorModel.model = editorModel.model || {};
      editorModel.model.answerBlankSize = editorModel.model.answerBlankSize.toString() || 8;
      editorModel.model.answerAlignment = editorModel.model.answerAlignment || 'left';
      scope.editorModel = editorModel;
    }

    function getModel() {
      var result = _.cloneDeep(scope.editorModel);

      if (!_.isEmpty(scope.correctResponseInput)) {

      }

      setFeedbackValue(result.correctResponses.feedback, defaultCorrectFeedback);
      setFeedbackValue(result.partialResponses.feedback, defaultPartialFeedback);
      setFeedbackValue(result.incorrectResponses.feedback, defaultIncorrectFeedback);

      return result;
    }

    function createResponsesModel(award) {
      return {
        values: [],
        award: award,
        ignoreCase: false,
        ignoreWhitespace: true,
        feedback: {
          type: 'default',
          custom: ''
        }
      };
    }

    function updateModel() {
      console.log("updateModel");
      _.assign(scope.fullModel, getModel());
    }

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
            return '';
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
      var result = scope.editorModel.correctResponses ? _.sample(scope.editorModel.correctResponses.values) : '';
      return result;
    }

    // Workaround for https://github.com/ivaynberg/select2/issues/291
    function fixPlaceholderCutOff() {
      var done = false;

      $('input.ui-select-search', element).each(function (i, el) {
        var $el = $(el);
        if($el.css('width')) {
          $el.css('width', '');
          done = true;
        }
      });

      if(!done){
        $timeout(fixPlaceholderCutOff, 200);
      }
    }

    function onBlurCorrectResponse(text) {
      var newAnswer = trim(text);
      if (!_.isEmpty(newAnswer)) {
        scope.editorModel.correctResponses.values.push(newAnswer);
      }
    }

    function onBlurPartialResponse(text) {
      var newAnswer = trim(text);
      if (!_.isEmpty(newAnswer)) {
        scope.editorModel.partialResponses.values.push(newAnswer);
      }
    }

    function trim(s) {
      return s ? ("" + s).trim() : "";
    }

  }

  function template() {
    return [
      '<div class="config-text-entry">',
      '  <div class="container-fluid">',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      '        <p>',
      '          In Short Answer &mdash; Enter Text, students will respond to a prompt (e.g., calculate, identify,',
      '          compute), and the answer will be evaluated.',
      '        </p>',
      '      </div>',
      '    </div>',
      '    <div class="row correct-answers">',
      '      <div class="col-xs-12">',
      '        <label class="control-label">Correct Answers</label>',
      '        <p>Additional correct answers may be added by clicking <b>tab</b> or <b>enter/return</b> between answers.</p>',
      '      </div>',
      '    </div>',
      '    <div cs-text-entry-response-input ',
      '        model="editorModel.correctResponses" ',
      '        prompt="correctResponsesPrompt"',
      '        on-blur="onBlurCorrectResponse(text)"/>',
      '    <div class="row partially-correct-answers">',
      '      <div class="col-xs-12">',
      '        <label class="control-label">Partially Correct Answers (optional)</label>',
      '        <p>Additional partially correct answers may be added by clicking <b>tab</b> or <b>enter/return</b> between answers.</p>',
      '      </div>',
      '    </div>',
      '    <div cs-text-entry-response-input ',
      '        model="editorModel.partialResponses" ',
      '        prompt="partialResponsesPrompt"',
      '        on-blur="onBlurPartialResponse(text)"/>',
      '    <div class="row award-row">',
      '      <div class="col-xs-12">',
      '        Award ',
      '        <input class="award-percent" type="number" ',
      '           ng-model="editorModel.partialResponses.award" ',
      '           min="0"',
      '           max="100"/> ',
      '        % of full credit for a partially correct answer',
      '      </div>',
      '    </div>',
      '    <hr/>',
      '    <div class="row text-field-size-row">',
      '      <div class="col-xs-12">',
      '        <label class="control-label">Answer blank size</label>',
      '        <div ng-repeat="o in answerBlankSizeDataProvider">',
      '          <radio value="{{o.size}}" ng-model="editorModel.model.answerBlankSize">',
      '          <input type="text" readonly value="{{o.demoLabel}}" size="{{makeItBigEnough(o.size)}}"/> <span>{{o.defaultLabel}}</span>',
      '          </radio>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <br>',
      '    <div class="row text-field-size-row">',
      '      <div class="col-xs-12">',
      '        <label class="control-label">Response options</label>',
      '        <div><checkbox ng-model="editorModel.model.allowIntegersOnly">Restrict the responses to integers only</checkbox></div>',
      '        <div class="restrictions" ng-show="editorModel.model.allowIntegersOnly">',
      '          <checkbox ng-model="editorModel.model.allowDecimal">Allow Decimals</checkbox>',
      '          <checkbox ng-model="editorModel.model.allowSeparator">Allow Thousands Separators</checkbox>',
      '          <checkbox ng-model="editorModel.model.allowNegative">Allow Negative Numbers</checkbox>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="row align-row">',
      '      <div class="col-xs-12">',
      '        <label class="control-label">Align text in answer blank:</label>',
      '        <select class="form-control" ng-model="editorModel.model.answerAlignment">',
      '          <option value="left">Left</option>',
      '          <option value="center">Center</option>',
      '          <option value="right">Right</option>',
      '        </select>',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="col-xs-12">',
      feedbackConfigPanel(),
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function feedbackConfigPanel() {
    return [
      '<div feedback-panel>',
      '  <div feedback-selector',
      '      fb-sel-label="If correct, show"',
      '      fb-sel-class="correct"',
      '      fb-sel-feedback-type="editorModel.correctResponses.feedback.type"',
      '      fb-sel-custom-feedback="editorModel.correctResponses.feedback.custom"',
      '      fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If partially correct, show"',
      '      fb-sel-class="partial"',
      '      fb-sel-feedback-type="editorModel.partialResponses.feedback.type"',
      '      fb-sel-custom-feedback="editorModel.partialResponses.feedback.custom"',
      '      fb-sel-default-feedback="{{defaultPartialFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If incorrect, show"',
      '      fb-sel-class="incorrect"',
      '      fb-sel-feedback-type="editorModel.incorrectResponses.feedback.type"',
      '      fb-sel-custom-feedback="editorModel.incorrectResponses.feedback.custom"',
      '      fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
      '  </div>',
      '</div>'
    ].join('\n');
  }
}


function csTextEntryResponseInput($log) {

  return {
    link: link,
    restrict: 'A',
    replace: true,
    scope: {
      model: '=model',
      prompt: '=prompt',
      onBlur: '&'
    },
    template: template()
  };

  function link(scope, elem, attr) {
    scope.saveSearch = function(text) {
      scope.savedSearch = text;
    };
    elem.find('input.ui-select-search').on('blur', function() {
      scope.onBlur({
        text: scope.savedSearch
      });
    });
  }

  function template() {
    return [
      '<div>',
      '  <div class="row response-input">',
      '    <div class="col-xs-9">',
      '      <ui-select ',
      '          multiple',
      '          ng-disabled="disabled"',
      '          ng-model="model.values"',
      '          tagging',
      '          tagging-label="false"',
      '          tagging-tokens="ENTER"',
      '          theme="bootstrap"',
      '          title="prompt">',
      '        <ui-select-match placeholder="{{prompt}}" data-on-change-search="{{saveSearch($select.search)}}">{{$item}}</ui-select-match>',
      '        <ui-select-choices repeat="c in model.values">{{c}}</ui-select-choices>',
      '      </ui-select>',
      '    </div>',
      '  </div>',
      '  <div class="row ignore-row">',
      '    <div class="col-xs-12 answer-options">',
      '      <checkbox value="ignore-case"',
      '          ng-init="model.caseSensitive = !model.ignoreCase"',
      '          ng-model="model.caseSensitive"',
      '          ng-change="model.ignoreCase = !model.caseSensitive">',
      '        Case sensitive?',
      '      </checkbox>',
      '      <checkbox value="ignore-whitespace"',
      '          ng-model="model.ignoreWhitespace">',
      '        Ignore spacing?',
      '      </checkbox>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');
  }
}