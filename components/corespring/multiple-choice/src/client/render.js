exports.framework = 'angular';
exports.directive = [
  '$log',
  '$sce',
  '$timeout',
  MultipleChoiceDirective];


function MultipleChoiceDirective(
  $log,
  $sce,
  $timeout
) {

  return {
    link: link,
    replace: true,
    restrict: 'EA',
    scope: {},
    template: template()
  };

  function link(scope, element, attrs) {

    scope.bridge = {      answerVisible: false    };
    scope.editable = true;
    scope.inputType = 'checkbox';
    scope.rationaleOpen = false;
    scope.showHide = {      'false': 'show',      'true': 'hide'    };

    scope.choiceClass = choiceClass;
    scope.isHorizontal = isHorizontal;
    scope.isTile = isTile;
    scope.isVertical = isVertical;
    scope.letter = letter;
    scope.onClickChoice = onClickChoice;
    scope.shuffle = shuffle;

    scope.containerBridge = {
      answerChangedHandler: answerChangedHandler,
      editable: setEditable,
      getSession: getSession,
      isAnswerEmpty: isAnswerEmpty,
      reset: reset,
      resetStash: resetStash,
      setDataAndSession: setDataAndSession,
      setInstructorData: setInstructorData,
      setMode: setMode,
      setResponse: setResponse
    };

    scope.$watch('bridge.answerVisible', watchAnswerVisible);
    scope.$watch('panelOpen', watchPanelOpen);

    scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

    //------------------------------------------------
    // only functions below
    //------------------------------------------------

    function setDataAndSession(dataAndSession) {
      scope.question = dataAndSession.data.model || {};
      scope.question.config = getConfigWithDefaults(scope.question.config);
      scope.session = dataAndSession.session || {};
      scope.answer = {
        choices: {},
        choice: ""
      };
      updateUi();
    }

    function getConfigWithDefaults(input) {
      var config = _.defaults(input || {}, {
        "orientation": "vertical",
        "shuffle": false,
        "choiceType": "radio",
        "choiceLabels": "letters",
        "showCorrectAnswer": "separately"
      });
      config.shuffle = config.shuffle === true || config.shuffle === 'true';
      return config;
    }

    function getSession() {
      var stash = (scope.session && scope.session.stash) ? scope.session.stash : {};
      return {
        answers: getAnswers(),
        stash: stash
      };
    }

    function setInstructorData(data) {
      _.each(scope.choices, function(c) {
        if (_.contains(_.flatten([data.correctResponse.value]), c.value)) {
          c.correct = true;
        }
      });
      if (!_.isEmpty(data.rationales)) {
        var rationales = _.map(scope.choices, function(c) {
          return {
            choice: c.value,
            rationale: (_.find(data.rationales, function(r) {
              return r.choice === c.value;
            }) || {}).rationale
          };
        });
        scope.rationales = rationales;
      }
    }

    // sets the server's response
    function setResponse(response) {
      $(element).find(".feedback-panel").hide();

      resetFeedback(scope.choices);

      scope.response = response;

      if (response.feedback) {
        if (response.feedback.emptyAnswer) {
          scope.feedback = response.feedback;
        } else {
          _.each(response.feedback, function(fb) {
            var choice = _.find(scope.choices, function(c) {
              return c.value === fb.value;
            });

            if (choice !== null) {
              choice.feedback = fb.feedback;
              choice.correct = fb.correct;
            }
          });
        }
      }

      setTimeout(function() {
        $(element).find(".feedback-panel.visible").slideDown(400);
      }, 10);
    }

    function setMode(value) {
      scope.playerMode = value;
      if (value !== 'instructor') {
        scope.rationales = undefined;
      }
      updateUi();
    }

    /**
     * Reset the ui back to an unanswered state
     */
    function reset() {
      $(element).find(".feedback-panel").hide();
      resetChoices();
      resetFeedback(scope.choices);
      scope.response = undefined;
      resetShuffledOrder();
      updateUi();
    }

    function resetStash() {
      scope.session.stash = {};
    }

    function isAnswerEmpty() {
      return _.isEmpty(this.getSession().answers);
    }

    function answerChangedHandler(callback) {
      scope.$watch("answer", function(newValue, oldValue) {
        if (newValue !== oldValue) {
          callback();
        }
      }, true);
    }

    function setEditable(e) {
      scope.editable = e;
    }

    function getAnswers() {
      if (scope.answer.choice) {
        return [scope.answer.choice];
      } else {
        var isSelected = function(k) {
          return scope.answer.choices[k] === true;
        };
        var allKeys = _.keys(scope.answer.choices);
        var keys = _.filter(allKeys, isSelected);
        return keys;
      }
    }

    function applyChoices() {

      if (!scope.question || !scope.session.answers) {
        return;
      }

      var answers = scope.session.answers;

      if (scope.inputType === "radio") {
        if (_.isArray(answers) && answers.length > 0) {
          scope.answer.choice = answers[0];
        }
      }
      if (scope.inputType === "checkbox") {
        _.forEach(answers, function(key) {
          scope.answer.choices[key] = true;
        });
      }
    }

    function resetFeedback(choices) {
      _.each(choices, function(c) {
        if (c) {
          delete c.feedback;
          delete c.correct;
        }
      });
    }

    function resetChoices() {
      scope.answer.choices = {};
      scope.answer.choice = "";
    }

    function shuffle(choices) {
      var allChoices = _.cloneDeep(choices);
      var shuffledChoices = _(allChoices).filter(choiceShouldBeShuffled).shuffle().value();
      return _.map(allChoices, function(choice) {
        if (choiceShouldBeShuffled(choice)) {
          return shuffledChoices.pop();
        } else {
          return choice;
        }
      });
    }

    function choiceShouldBeShuffled(choice) {
      return _.isUndefined(choice.shuffle) || choice.shuffle === true;
    }

    function layoutChoices(choices, order) {
      if (!order) {
        return scope.shuffle(choices);
      }
      var ordered = _(order).map(function(v) {
        return _.find(choices, function(c) {
          return c.value === v;
        });
      }).filter(function(v) {
        return v;
      }).value();

      var missing = _.difference(choices, ordered);
      return _.union(ordered, missing);
    }

    function stashOrder(choices) {
      return _.map(choices, function(c) {
        return c.value;
      });
    }

    function resetShuffledOrder() {
      if (scope.session && scope.session.stash) {
        delete scope.session.stash.shuffledOrder;
      }
    }

    function updateUi() {
      if (!scope.question || !scope.session) {
        return;
      }

      var model = scope.question;
      var stash = scope.session.stash = scope.session.stash || {};
      var answers = scope.session.answers = scope.session.answers || {};

      scope.inputType = model.config.choiceType;

      var shouldShuffle = model.config.shuffle && scope.playerMode !== 'instructor';
      var clonedChoices = _.cloneDeep(model.choices);

      if (shouldShuffle) {
        if (stash.shuffledOrder) {
          scope.choices = layoutChoices(clonedChoices, stash.shuffledOrder);
        } else if( scope.playerMode === 'view' || scope.playerMode === 'evaluate' ){
          //CO-696 Some sessions don't have a shuffledOrder in the stash bc. the code
          //had been erroneously removed for about 1.5 months. For these we are using
          //the default order, because updating the db is too complicated
          scope.choices = clonedChoices;
        } else {
          scope.choices = layoutChoices(clonedChoices);
          stash.shuffledOrder = stashOrder(scope.choices);
          scope.$emit('saveStash', attrs.id, stash);
        }
      } else {
        scope.choices = clonedChoices;
      }

      applyChoices();
    }

    function letter(idx) {
      var type = scope.question ? scope.question.config.choiceLabels : "letters";
      switch (type) {
        case "none":
          return "";
        case "numbers":
          return (idx + 1) + "";
      }

      // default to letters: A...Z
      return String.fromCharCode(('A').charCodeAt(0) + idx);
    }

    function isVertical() {
      return orientation() === 'vertical';
    }

    function isHorizontal() {
      return orientation() === 'horizontal';
    }

    function isTile() {
      return orientation() === 'tile';
    }

    function orientation() {
      return scope.question ? scope.question.config.orientation : 'vertical';
    }

    function onClickChoice(choice) {
      if (scope.editable) {
        if (scope.inputType === 'radio') {
          scope.answer.choice = choice.value;
        } else {
          scope.answer.choices[choice.value] = !scope.answer.choices[choice.value];
        }
      }
    }

    function watchPanelOpen(n) {
      if (n) {
        $(element).find('.panel-collapse').slideDown(400);
      } else {
        $(element).find('.panel-collapse').slideUp(400);
      }
    }

    function watchAnswerVisible(n) {
      if (n) {
        $(element).find('.answer-collapse').slideDown(400);
      } else {
        $(element).find('.answer-collapse').slideUp(400);
      }
    }

    function choiceClass(o) {
      var isSelected = (scope.answer.choice === o.value || scope.answer.choices[o.value]);
      var res = isSelected ? "selected " : "";

      if (_.isUndefined(o.correct)) {
        return res + "default";
      }

      if (o.correct && (scope.question.config.showCorrectAnswer === "inline" || scope.playerMode === 'instructor')) {
        res = "selected ";
      }

      return res + (o.correct ? 'correct' : 'incorrect');
    }
  }

  function template() {
    var seeAnswer = [
      '<div class="answer-holder"',
      '    ng-show="response && response.correctness != \'correct\' && response.correctness != \'warning\' && question.config.showCorrectAnswer === \'separately\'">',
      '  <div class="panel panel-default">',
      '    <div class="panel-heading">',
      '      <h4 class="panel-title"',
      '          ng-click="bridge.answerVisible = !bridge.answerVisible">',
      '        <i class="answerIcon fa fa-eye{{bridge.answerVisible ? \'-slash\' : \'\'}}"></i>',
      '        {{bridge.answerVisible ? \'Hide Answer\' : \'Show Correct Answer\'}}',
      '      </h4>',
      '    </div>',
      '    <div class="answer-collapse">',
      '      <div class="panel-body">',
      '        <div ng-repeat="o in choices"',
      '            class="choice-holder-background answer {{question.config.orientation}} {{question.config.choiceStyle}}"',
      '            ng-click="onClickChoice(o)"',
      '            ng-class="{correct: o.correct, selected: o.correct}">',
      '          <div class="choice-holder"',
      '              ng-class="{true:\'correct\'}[o.correct]">',
      '            <span class="choice-input"',
      '                ng-switch="inputType">',
      '              <div class="checkbox-choice"',
      '                  ng-switch-when="checkbox"',
      '                  ng-disabled="!editable"',
      '                  ng-value="o.value">',
      '                <div class="checkbox-button"/>',
      '              </div>',
      '                <div class="radio-choice"',
      '                    ng-switch-when="radio"',
      '                    ng-disabled="!editable">',
      '                  <div class="radio-button"/>',
      '                </div>',
      '              </span>',
      '            <label class="choice-letter"',
      '                ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '            <label class="choice-currency-symbol"',
      '                ng-show="o.labelType == \'currency\'">$</label>',
      '            <div class="choice-label"',
      '                ng-switch="o.labelType">',
      '              <img class="choice-image"',
      '                  ng-switch-when="image"',
      '                  ng-src="{{o.imageName}}"/>',
      '              <span ng-switch-default',
      '                  ng-bind-html-unsafe="o.label"></span>',
      '            </div>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="answer-holder"',
      '    ng-show="response && response.correctness === \'warning\'">',
      '  <div class="alert alert-danger"',
      '      role="alert">{{feedback && feedback.message ? feedback.message : \'Error\'}}',
      '  </div>',
      '</div>'
    ].join('');

    var verticalTemplate = [
      '<div class="choices-container"',
      '    ng-class="question.config.orientation">',
      '  <div ng-repeat="o in choices"',
      '      class="choice-holder-background {{question.config.orientation}} {{question.config.choiceStyle}}"',
      '      ng-click="onClickChoice(o)"',
      '      ng-class="choiceClass(o)">',
      '    <div class="choice-holder">',
      '      <span class="choice-input"',
      '          ng-switch="inputType">',
      '        <div class="checkbox-choice"',
      '            ng-switch-when="checkbox"',
      '            ng-disabled="!editable"',
      '            ng-value="o.value">',
      '          <div class="checkbox-button"/>',
      '        </div>',
      '        <div class="radio-choice"',
      '            ng-switch-when="radio"',
      '            ng-disabled="!editable"',
      '            ng-value="o.value">',
      '          <div class="radio-button"/>',
      '        </div>',
      '      </span>',
      '      <label class="choice-letter"',
      '          ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '      <label class="choice-currency-symbol"',
      '          ng-show="o.labelType == \'currency\'">$</label>',
      '      <div class="choice-label"',
      '          ng-switch="o.labelType">',
      '        <img class="choice-image"',
      '            ng-switch-when="image"',
      '            ng-src="{{o.imageName}}"/>',
      '        <span ng-switch-default',
      '            ng-bind-html-unsafe="o.label"></span>',
      '      </div>',
      '    </div>',
      '    <div class="choice-feedback-holder"',
      '        ng-show="answer.choice == o.value || answer.choices[o.value] || (o.correct && question.config.showCorrectAnswer !== \'separately\')">',
      '      <div class="panel panel-default feedback-panel {{o.correct ? \'correct\' : \'incorrect\'}}"',
      '          ng-class="{visible: o.feedback}"',
      '          style="display: none">',
      '        <div class="panel-heading">&nbsp;</div>',
      '        <div class="panel-body">',
      '          <span type="success"',
      '              ng-bind-html-unsafe="o.feedback"></span>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      seeAnswer,
      '  <div class="rationale-expander"',
      '      ng-show="rationales">',
      '    <div class="rationale-expander-row {{showHide[rationaleOpen.toString()]}}-state"',
      '        ng-click="rationaleOpen = !rationaleOpen">',
      '      <span class="rationale-expander-{{showHide[rationaleOpen.toString()]}}"></span>',
      '      <span class="rationale-expander-label">Rationale</span>',
      '    </div>',
      '    <div class="rationale-body"',
      '        ng-show="rationaleOpen">',
      '      <div ng-repeat="r in rationales">',
      '        <label class="choice-letter"',
      '            ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '        <span class="choice-label"',
      '            ng-bind-html-unsafe="r.rationale"></span>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("");

    var horizontalTemplate = [
      '<div class="choices-container"',
      '    ng-class="question.config.orientation">',
      '  <div ng-repeat="o in choices"',
      '      class="choice-holder {{question.config.orientation}} {{question.config.choiceStyle}}"',
      '      ng-click="onClickChoice(o)"',
      '      ng-class="{true:\'correct\ false:\'incorrect\'}[o.correct]">',
      '    <div class="choice-wrapper">',
      '      <label class="choice-letter"',
      '          ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '      <label class="choice-currency-symbol"',
      '          ng-show="o.labelType == \'currency\'">$</label>',
      '      <div class="choice-label"',
      '          ng-switch="o.labelType">',
      '        <img class="choice-image"',
      '            ng-switch-when="image"',
      '            ng-src="{{o.imageName}}"/>',
      '        <span ng-switch-when="mathml"',
      '            ng-bind-html-unsafe="o.mathml"></span>',
      '        <span ng-switch-default',
      '            ng-bind-html-unsafe="o.label"></span>',
      '      </div>',
      '      <div ng-switch="inputType">',
      '        <input ng-switch-when="checkbox"',
      '            type="checkbox"',
      '            ng-disabled="!editable"',
      '            ng-value="o.label"',
      '            ng-checked="answer.choices[o.value]"/>',
      '        <input ng-switch-when="radio"',
      '            type="radio"',
      '            ng-disabled="!editable"',
      '            ng-value="o.value"',
      '            ng-checked="answer.choice == o.value"/>',
      '      </div>',
      '      <div class="choice-feedback-holder"',
      '          ng-show="o.feedback != null">',
      '        <span class="cs-feedback"',
      '            ng-class="{true:\'correct\ false:\'incorrect\'}[o.correct]"',
      '            ng-show="o.feedback != null"',
      '            ng-bind-html-unsafe="o.feedback"></span>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    var tileTemplate = [
      '<div class="choices-container"',
      '    ng-class="question.config.orientation">',
      '  <div ng-repeat="o in choices"',
      '      class="choice-holder {{question.config.orientation}} {{question.config.choiceStyle}}"',
      '      ng-class="{true:\'correct\ false:\'incorrect\'}[o.correct]">',
      '    <div class="choice-wrapper">',
      '      <label class="choice-letter"',
      '          ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '      <label class="choice-currency-symbol"',
      '          ng-show="o.labelType == \'currency\'">$</label>',
      '      <div class="choice-label"',
      '          ng-switch="o.labelType">',
      '        <img class="choice-image"',
      '            ng-switch-when="image"',
      '            ng-src="{{o.imageName}}"/>',
      '        <span ng-switch-when="mathml"',
      '            ng-bind-html-unsafe="o.mathml"></span>',
      '        <span ng-switch-default',
      '            ng-bind-html-unsafe="o.label"></span>',
      '      </div>',
      '      <div ng-switch="inputType">',
      '        <input ng-switch-when="checkbox"',
      '            type="checkbox"',
      '            ng-disabled="!editable"',
      '            ng-value="o.label"',
      '            ng-model="answer.choices[o.value]"/>',
      '        <input ng-switch-when="radio"',
      '            type="radio"',
      '            ng-disabled="!editable"',
      '            ng-value="o.value"',
      '            ng-model="answer.choice"/>',
      '      </div>',
      '      <div class="choice-feedback-holder"',
      '          ng-show="o.feedback != null">',
      '        <div class="cs-feedback"',
      '            ng-class="{true:\'correct\ false:\'incorrect\'}[o.correct]"',
      '            ng-show="o.feedback != null"></div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    return [
      '<div class="view-multiple-choice"',
      '    ng-class="response.correctness">',
      '  <div ng-if="isVertical()">' + verticalTemplate + '</div>',
      '  <div ng-if="isHorizontal()">' + horizontalTemplate + '</div>',
      '  <div ng-if="isTile()">' + tileTemplate + '</div>',
      '  <div class="summaryFeedbackPanel fade in ng-hide"',
      '      ng-show="response.comments">',
      '    <div class="">',
      '      <div class="panel-group">',
      '        <div class="panel panel-default">',
      '          <div class="panel-heading">',
      '            <h4 class="panel-title">',
      '              <a class="learn-more-link"',
      '                  ng-click="panelOpen = !panelOpen">',
      '                <i class="learnMoreIcon fa fa-lightbulb-o"></i>Learn More',
      '              </a>',
      '            </h4>',
      '          </div>',
      '          <div class="panel-collapse collapse">',
      '            <div class="panel-body"',
      '                ng-bind-html-unsafe="response.comments"></div>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }

}