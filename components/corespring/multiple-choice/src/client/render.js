exports.framework = 'angular';
exports.directive = ['$sce', '$log', '$timeout', MultipleChoiceDirective];


function MultipleChoiceDirective($sce, $log, $timeout) {

  return {
    scope: {},
    restrict: 'EA',
    replace: true,
    link: link,
    template: template()
  };

  function link(scope, element, attrs) {

    scope.inputType = 'checkbox';
    scope.editable = true;
    scope.showCorrectAnswerButton = false;
    scope.bridge = {
      viewMode: 'normal',
      answerVisible: false
    };
    scope.showHide = {
      'false': 'show',
      'true': 'hide'
    };
    scope.rationaleOpen = false;

    scope.choiceClass = choiceClass;
    scope.hasBlockFeedback = hasBlockFeedback;
    scope.interactionCorrectnessClass = interactionCorrectnessClass;
    scope.isHorizontal = isHorizontal;
    scope.isTile = isTile;
    scope.isVertical = isVertical;
    scope.letter = letter;
    scope.onClickChoice = onClickChoice;
    scope.radioState = radioState;
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
      setPlayerSkin: setPlayerSkin,
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

    function getConfigWithDefaults(input){
      var config = _.defaults(input || {}, {
        "orientation": "vertical",
        "shuffle": false,
        "choiceType": "radio",
        "choiceLabels": "letters",
        "showCorrectAnswer": "separately",
        "useBlockFeedback": true
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

    function setPlayerSkin(skin) {
      scope.iconset = skin.iconSet;
    }

    function setInstructorData(data) {
      scope.instructorData = data;
      updateUi();
    }

    function applyInstructorData(){
      var data = scope.instructorData;
      if(!data) {
        return;
      }

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
          scope.showCorrectAnswerButton = response &&
            response.correctness === 'incorrect' &&
            scope.question.config.showCorrectAnswer !== 'inline';
        }
      }

      $timeout(function() {
        $(element).find(".feedback-panel.visible").slideDown(400);
      }, 10);
    }

    function setMode(value) {
      scope.playerMode = value;
      if (value !== 'instructor') {
        scope.rationales = undefined;
        scope.instructorData = undefined;
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
      scope.showCorrectAnswerButton = false;
      scope.bridge.viewMode = 'normal';
      scope.bridge.answerVisible = false;
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
        if ( _.isArray(answers) && answers.length > 0) {
          scope.answer.choice = answers[0];
        }
      } else if (scope.inputType === "checkbox") {
        _.forEach(answers, function(key){
          scope.answer.choices[key] = true;
        });
      }
    }

    function resetFeedback(choices) {
      scope.feedback = null;

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
      return _.map(allChoices, function(choice){
        if (choiceShouldBeShuffled(choice)) {
          return shuffledChoices.pop();
        } else {
          return choice;
        }
      });
    }

    function choiceShouldBeShuffled(choice){
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
      var clonedChoices = _.cloneDeep(model.choices);
      var shouldShuffle = model.config.shuffle && scope.playerMode !== 'instructor';

      if (shouldShuffle) {
        if (stash.shuffledOrder) {
          scope.choices = layoutChoices(clonedChoices, stash.shuffledOrder);
        } else {
          scope.choices = layoutChoices(clonedChoices);
          stash.shuffledOrder = stashOrder(scope.choices);
          scope.$emit('saveStash', attrs.id, stash);
        }
      } else {
        scope.choices = clonedChoices;
      }

      applyChoices();
      applyInstructorData();
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
      slide(n, $(element).find('.panel-collapse'));
    }

    function slide(down, $elm) {
      if (down) {
        $elm.slideDown(400);
      } else {
        $elm.slideUp(400);
      }
    }

    function watchAnswerVisible(n) {
      scope.bridge.viewMode = n ? 'correct' : 'normal';
    }

    function interactionCorrectnessClass() {
      if (scope.bridge.viewMode === 'correct') {
        return "";
      }
      return scope.response && scope.response.correctness;
    }

    function choiceClass(o) {
      var isSelected = (scope.answer.choice === o.value || scope.answer.choices[o.value]);
      var isCorrect = !_.isUndefined(o.correct) && o.correct;
      var res = isSelected ? "selected " : "";

      if (isCorrect && scope.playerMode === 'instructor') {
        return "correct";
      }
      if (_.isUndefined(o.correct)) {
        return res + "default";
      }
      if (scope.bridge.viewMode !== 'correct' && o.correct && !isSelected && scope.question.config.showCorrectAnswer !== "inline") {
        return "";
      }
      if (scope.bridge.viewMode === 'correct' && !isSelected) {
        return "";
      }
      return res + ((o.correct) ? 'correct' : 'incorrect');
    }

    function radioState(o) {
      var isSelected = (scope.answer.choice === o.value || scope.answer.choices[o.value]);
      if (isSelected && scope.playerMode === 'view') {
        return "selectedDisabled";
      }
      var isCorrect = !_.isUndefined(o.correct) && o.correct === true;
      if (isCorrect && scope.playerMode === 'instructor') {
        return "correctUnselected";
      }
      if (scope.bridge.viewMode !== 'correct' && o.correct && !isSelected && scope.question.config.showCorrectAnswer !== "inline") {
        return scope.response ? "muted" : "";
      }
      if (!_.isUndefined(o.correct) && o.correct === false && scope.bridge.viewMode !== 'correct') {
        return "incorrect";
      }
      if (!_.isUndefined(o.correct) && o.correct === true && scope.bridge.viewMode === 'correct') {
        return "correct";
      }
      if (isSelected && scope.bridge.viewMode !== 'correct') {
        return isCorrect ? "correct" : "selected";
      }
      if (!_.isUndefined(o.correct) && o.correct === true) {
        return "correct";
      }
      if (scope.response || scope.playerMode === 'view') {
        return "muted";
      }
      return "ready";
      }

    function hasBlockFeedback(o) {
      var isSelected = (scope.answer.choice === o.value || scope.answer.choices[o.value]);
      return o.feedback && isSelected;
    }
  }

  function template() {
    var noResponseTemplate = [
      '<div feedback="feedback.message" icon-set="{{iconset}}" correct-class="{{feedback.emptyAnswer && \'nothing-submitted\'}}"></div>'
    ].join('');

    var learnMoreTemplate = [
      '<div ng-if="response.comments">',
      '  <div icon-toggle icon-name="learn-more" class="icon-toggle-learnMore" ng-model="bridge.learnMoreOpen" label="Learn More">',
      '    <div class="learn-more-body" ng-bind-html-unsafe="response.comments"></div>',
      '  </div>',
      '</div>'
    ].join('');

    var rationalesTemplate = [
      '<div ng-if="rationales" icon-toggle icon-name="rationale" class="icon-toggle-rationales" ng-model="bridge.rationaleOpen" label="Rationales">',
      '      <div ng-repeat="r in rationales">',
      '    <label class="choice-letter" ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '    <span class="choice-label" ng-bind-html-unsafe="r.rationale"></span>',
      '  </div>',
      '</div>'
    ].join('');

    var choicesTemplate = [
      '<div class="choices-container">',
      '  <correct-answer-toggle visible="showCorrectAnswerButton" toggle="bridge.answerVisible"></correct-answer-toggle>',
      '  <div ng-repeat="o in choices" class="choice-holder-background {{question.config.orientation}} {{question.config.choiceStyle}}" ',
      '       ng-click="onClickChoice(o)" ng-class="choiceClass(o)">',
      '    <div class="choice-holder" >',
      '      <div class="choice-feedback" ng-if="playerMode !== \'instructor\'"',
      '           feedback-icon',
      '           feedback-icon-choice="o"',
      '           feedback-icon-class="{{choiceClass(o)}}"',
      '           feedback-icon-type="{{question.config.choiceType}}"',
      '           feedback-icon-set="{{iconset}}"',
      '           feedback-icon-use-block-feedback="{{question.config.useBlockFeedback}}" />',
      '      <span class="choice-input" ng-switch="inputType">',
      '        <div class="checkbox-choice" ng-switch-when="checkbox" ng-disabled="!editable" ng-value="o.value">',
      '          <div choice-checkbox-button checkbox-button-state="{{radioState(o)}}" checkbox-button-choice="o" />',
      '      </div>',
      '        <div class="radio-choice" ng-switch-when="radio" ng-disabled="!editable" ng-value="o.value">',
      '          <div choice-radio-button radio-button-state="{{radioState(o)}}" radio-button-choice="o" />',
      '      </div>',
      '      </span>',
      '      <label class="choice-letter" ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '      <label class="choice-currency-symbol"  ng-show="o.labelType == \'currency\'">$</label>',
      '      <div class="choice-label" ng-bind-html-unsafe="o.label"></div>',
      '      <div ng-if="question.config.useBlockFeedback" class="block-feedback" ng-show="!bridge.answerVisible && hasBlockFeedback(o)" ng-bind-html-unsafe="o.feedback"></div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    return [
        '<div class="view-multiple-choice" ng-class="interactionCorrectnessClass()">',
        choicesTemplate,
        rationalesTemplate,
        noResponseTemplate,
        learnMoreTemplate
      ].join('\n');
  }

}