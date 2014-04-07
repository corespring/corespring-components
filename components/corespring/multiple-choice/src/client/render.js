var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {

      scope.inputType = 'checkbox';
      scope.editable = true;
      scope.answer = {
        choices: {},
        choice: ""
      };

      var getAnswers = function() {
        if (scope.answer.choice) {
          return [scope.answer.choice];
        } else {
          var isTrue = function(k) {
            return scope.answer.choices[k] === true;
          };
          var allKeys = _.keys(scope.answer.choices);
          var keys = _.filter(allKeys, isTrue);
          return keys;
        }
      };

      var applyChoices = function() {

        if (!scope.question || !scope.session.answers) {
          return;
        }

        var answers = scope.session.answers;

        if (scope.inputType === "radio") {
          scope.answer.choice = answers[0];
        } else {
          for (var i = 0; i < answers.length; i++) {
            var key = answers[i];
            scope.answer.choices[key] = true;
          }
        }
      };

      var resetFeedback = function(choices) {
        _.each(choices, function(c) {
          if (c) {
            delete c.feedback;
            delete c.correct;
          }
        });
      };

      var resetChoices = function() {
        scope.answer.choices = {};
        scope.answer.choice = "";
      };

      var layoutChoices = function(choices, order) {
        if (!order) {
          var shuffled = _.shuffle(_.cloneDeep(choices));
          return shuffled;
        } else {
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
      };

      var stashOrder = function(choices) {
        return _.map(choices, function(c) {
          return c.value;
        });
      };

      var updateUi = function() {

        if (!scope.question || !scope.session) {
          return;
        }

        resetChoices();

        var model = scope.question;
        var stash = scope.session.stash = scope.session.stash || {};
        var answers = scope.session.answers = scope.session.answers || {};

        var shuffle = model.config.shuffle === true || model.config.shuffle === "true";

        scope.inputType = !! model.config.singleChoice ? "radio" : "checkbox";

        if (stash.shuffledOrder && shuffle) {
          scope.choices = layoutChoices(model.choices, stash.shuffledOrder);
        } else if (shuffle) {
          scope.choices = layoutChoices(model.choices);
          stash.shuffledOrder = stashOrder(scope.choices);
          scope.$emit('saveStash', attrs.id, stash);
        } else {
          scope.choices = _.cloneDeep(scope.question.choices);
        }

        applyChoices();
      };

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          scope.question = dataAndSession.data.model;
          scope.session = dataAndSession.session || {};
          updateUi();
        },

        getSession: function() {

          var stash = (scope.session && scope.session.stash) ? scope.session.stash : {};

          return {
            answers: getAnswers(),
            stash: stash
          };
        },

        // sets the server's response
        setResponse: function(response) {

          resetFeedback(scope.choices);

          scope.response = response;
          if (response.feedback) {
            _.each(response.feedback, function(fb) {

              var choice = _.find(scope.choices, function(c) {
                return c.value === fb.value;
              });

              if (choice !== null) {
                choice.feedback = fb.feedback;
                choice.correct = fb.correct;
              }
              console.log("choice: ", choice);
            });
          }
        },
        setMode: function(newMode) {},
        /**
         * Reset the ui back to an unanswered state
         */
        reset: function() {
          resetChoices();
          resetFeedback(scope.choices);
        },
        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },
        answerChangedHandler: function(callback) {
          scope.$watch("answer", function(newValue, oldValue) {
            if (newValue) {
              callback();
            }
          }, true);
        },
        editable: function(e) {
          scope.editable = e;
        }
      };

      scope.letter = function(idx) {
        return String.fromCharCode(65 + idx);
      };

      scope.isVertical = function() {
        return scope.question && scope.question.config && scope.question.config.orientation === 'vertical';
      };

      scope.isHorizontal = function() {
        return scope.question && scope.question.config && scope.question.config.orientation === 'horizontal';
      };

      scope.isTile = function() {
        return scope.question && scope.question.config && scope.question.config.orientation === 'tile';
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };

    var verticalTemplate = [
      '<div class="choices-container" ng-class="question.config.orientation">',
      '  <div ng-repeat-start="o in choices" class="choice-holder {{question.config.orientation}} {{question.config.choiceStyle}}" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]">',
      '    <span class="choice-input" ng-switch="inputType">',
      '      <input ng-switch-when="checkbox" type="checkbox" ng-disabled="!editable"  ng-value="o.label" ng-model="answer.choices[o.value]" />',
      '      <input ng-switch-when="radio" type="radio" ng-disabled="!editable" ng-value="o.value" ng-model="answer.choice" />',
      '    </span>',
      '    <label class="choice-letter">{{letter($index)}}.</label>',
      '    <label class="choice-currency-symbol"  ng-show="o.labelType == \'currency\'">$</label>',
      '    <div class="choice-label" ng-switch="o.labelType">',
      '      <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
      '      <span ng-switch-default ng-bind-html-unsafe="o.label"></span>',
      '    </div>',
      '  </div>',
      '  <div ng-repeat-end="" class="choice-feedback-holder" ng-show="o.feedback != null">',
      '    <span class="cs-feedback" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]" ng-show="o.feedback != null" ng-bind-html-unsafe="o.feedback"></span>',
      '  </div>',
      '</div>'
    ].join("");

    var horizontalTemplate = [
      '<div class="choices-container" ng-class="question.config.orientation">',
      '  <div ng-repeat="o in choices" class="choice-holder {{question.config.orientation}} {{question.config.choiceStyle}}" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]">',
      '    <div class="choice-wrapper">',
      '      <label class="choice-letter">{{letter($index)}}.</label>',
      '      <label class="choice-currency-symbol"  ng-show="o.labelType == \'currency\'">$</label>',
      '      <div class="choice-label" ng-switch="o.labelType">',
      '        <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
      '        <span ng-switch-when="mathml" ng-bind-html-unsafe="o.mathml"></span>',
      '        <span ng-switch-default ng-bind-html-unsafe="o.label"></span>',
      '      </div>',
      '      <div ng-switch="inputType">',
      '        <input ng-switch-when="checkbox" type="checkbox" ng-disabled="!editable"  ng-value="o.label" ng-model="answer.choices[o.value]" />',
      '        <input ng-switch-when="radio" type="radio" ng-disabled="!editable" ng-value="o.value" ng-model="answer.choice" />',
      '      </div>',
      '      <div class="choice-feedback-holder" ng-show="o.feedback != null">',
      '        <span class="cs-feedback" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]" ng-show="o.feedback != null" ng-bind-html-unsafe="o.feedback"></span>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("");

    var tileTemplate = [
      '<div class="choices-container" ng-class="question.config.orientation">',
      '  <div ng-repeat="o in choices" class="choice-holder {{question.config.orientation}} {{question.config.choiceStyle}}" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]">',
      '    <div class="choice-wrapper">',
      '      <label class="choice-letter">{{letter($index)}}.</label>',
      '      <label class="choice-currency-symbol"  ng-show="o.labelType == \'currency\'">$</label>',
      '      <div class="choice-label" ng-switch="o.labelType">',
      '        <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
      '        <span ng-switch-when="mathml" ng-bind-html-unsafe="o.mathml"></span>',
      '        <span ng-switch-default ng-bind-html-unsafe="o.label"></span>',
      '      </div>',
      '      <div ng-switch="inputType">',
      '        <input ng-switch-when="checkbox" type="checkbox" ng-disabled="!editable"  ng-value="o.label" ng-model="answer.choices[o.value]" />',
      '        <input ng-switch-when="radio" type="radio" ng-disabled="!editable" ng-value="o.value" ng-model="answer.choice" />',
      '      </div>',
      '      <div class="choice-feedback-holder" ng-show="o.feedback != null">',
      '        <span class="cs-feedback" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]" ng-show="o.feedback != null"></span>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("");


    def = {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: [
        '<div class="view-multiple-choice">',
        '  <div ng-if="isVertical()">' + verticalTemplate + '</div>',
        '  <div ng-if="isHorizontal()">' + horizontalTemplate + '</div>',
        '  <div ng-if="isTile()">' + tileTemplate + '</div>',
        '</div>'
      ].join("\n")

    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;