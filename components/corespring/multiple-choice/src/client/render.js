var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {

      scope.inputType = 'checkbox';
      scope.editable = true;
      scope.bridge = {answerVisible: false, viewMode: 'normal'};
      scope.showHide = {'false': 'show', 'true': 'hide'};
      scope.rationaleOpen = false;

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

        if (scope.inputType === "radio" && _.isArray(answers) && answers.length > 0) {
          scope.answer.choice = answers[0];
        }
        if (scope.inputType === "checkbox") {
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

      function shuffle(choices) {
        function newIndex(item, array) {
          var t = _.find(array, function(el) {
            return el.value === item.value;
          });
          return t ? array.indexOf(t) : -1;
        }

        var shuffled = _.shuffle(_.cloneDeep(choices));
        _.each(choices, function(choice, index) {
          var temp;
          var remain = !_.isUndefined(choice.shuffle) && choice.shuffle === false;
          if (remain) {
            temp = shuffled[newIndex(choice, shuffled)];
            shuffled[newIndex(choice, shuffled)] = shuffled[index];
            shuffled[index] = temp;
          }
        });

        return shuffled;
      }

      var layoutChoices = function(choices, order) {
        if (!order) {
          return shuffle(choices);
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

        var model = scope.question;
        var stash = scope.session.stash = scope.session.stash || {};
        var answers = scope.session.answers = scope.session.answers || {};

        var shuffle = (model.config.shuffle === true || model.config.shuffle === "true") && scope.mode !== 'instructor';

        scope.inputType = model.config.choiceType;

        if (stash.shuffledOrder && shuffle) {
          scope.choices = layoutChoices(_.cloneDeep(model.choices), stash.shuffledOrder);
        } else if (shuffle) {
          scope.choices = layoutChoices(_.cloneDeep(model.choices));
          stash.shuffledOrder = stashOrder(scope.choices);
          scope.$emit('saveStash', attrs.id, stash);
        } else {
          scope.choices = _.cloneDeep(scope.question.choices);
        }

        applyChoices();
      };

      scope.containerBridge = {

        setPlayerSkin: function(skin) {
          console.log("Skin is ", skin);
          scope.iconset = skin.iconSet;
        },
        setDataAndSession: function(dataAndSession) {
          scope.question = dataAndSession.data.model;
          scope.question.config = _.defaults(scope.question.config || {}, {"showCorrectAnswer": "separately"});
          scope.session = dataAndSession.session || {};
          scope.answer = {
            choices: {},
            choice: ""
          };

          updateUi();
        },

        getSession: function() {
          var stash = (scope.session && scope.session.stash) ? scope.session.stash : {};
          return {
            answers: getAnswers(),
            stash: stash
          };
        },

        setInstructorData: function(data) {
          _.each(scope.choices, function(c) {
            if (_.contains(_.flatten([data.correctResponse.value]), c.value)) {
              c.correct = true;
            }
          });
          scope.response = {correctness: 'correct'};
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
        },

        // sets the server's response
        setResponse: function(response) {
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
        },

        setMode: function(newMode) {
          scope.mode = newMode;
          if (newMode == 'instructor') {
            //scope.bridge.viewMode = 'correct';
          } else {
            scope.rationales = undefined;
          }
        },
        /**
         * Reset the ui back to an unanswered state
         */
        reset: function() {
          $(element).find(".feedback-panel").hide();
          resetChoices();
          resetFeedback(scope.choices);
          scope.response = undefined;
          scope.bridge.viewMode = 'normal';
          scope.bridge.answerVisible = false;
        },
        resetStash: function() {
          scope.session.stash = {};
        },
        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },
        answerChangedHandler: function(callback) {
          scope.$watch("answer", function(newValue, oldValue) {
            if (newValue !== oldValue) {
              callback();
            }
          }, true);
        },
        editable: function(e) {
          scope.editable = e;
        }
      };

      scope.letter = function(idx) {
        var type = scope.question && scope.question.config ? scope.question.config.choiceLabels : "none";
        switch (type) {
          case "none":
            return "";
          case "numbers":
            return (idx + 1) + "";
        }

        // default to a...z
        return String.fromCharCode(65 + idx);
      };


      scope.isVertical = function() {
        return orientation() === 'vertical';
      };

      scope.isHorizontal = function() {
        return orientation() === 'horizontal';
      };

      scope.isTile = function() {
        return orientation() === 'tile';
      };

      function orientation() {
        return scope.question && scope.question.config ? scope.question.config.orientation : '';
      }

      scope.onClickChoice = function(choice) {
        if (scope.editable) {
          if (scope.inputType === 'radio') {
            scope.answer.choice = choice.value;
          } else {
            scope.answer.choices[choice.value] = !scope.answer.choices[choice.value];
          }
        }
      };

      scope.$watch('panelOpen', function(n) {
        if (n) {
          $(element).find('.panel-collapse').slideDown(400);
        } else {
          $(element).find('.panel-collapse').slideUp(400);
        }
      });

      scope.$watch('bridge.answerVisible', function(n) {
        scope.bridge.viewMode = n ? 'correct' : 'normal';
      });

      scope.interactionCorrectnessClass = function() {
        if (scope.bridge.viewMode === 'correct') {
          return "";
        }
        return scope.response && scope.response.correctness;
      };

      scope.choiceClass = function(o) {
        var isSelected = (scope.answer.choice === o.value || scope.answer.choices[o.value]);
        var isCorrect = !_.isUndefined(o.correct) && o.correct;
        var res = isSelected ? "selected " : "";

        if (isCorrect && scope.mode == 'instructor') {
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
      };

      scope.radioState = function(o) {
        var isSelected = (scope.answer.choice === o.value || scope.answer.choices[o.value]);
        var isCorrect = !_.isUndefined(o.correct) && o.correct == true;
        if (isCorrect && scope.mode == 'instructor') {
          return "correctUnselected";
        }
        if (scope.bridge.viewMode !== 'correct' && o.correct && !isSelected && scope.question.config.showCorrectAnswer !== "inline") {
          return scope.response ? "muted" : "";
        }
        if (!_.isUndefined(o.correct) && o.correct == false && scope.bridge.viewMode !== 'correct') return "incorrect";
        if (!_.isUndefined(o.correct) && o.correct == true && scope.bridge.viewMode === 'correct') return "correct";
        if (isSelected && scope.bridge.viewMode !== 'correct') return isCorrect ? "correct" : "selected";
        if (!_.isUndefined(o.correct) && o.correct == true) return "correct";
        if (scope.response) return "muted";
      };


      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);
    };


    var noResponseTemplate = [
      '<div class="empty-response-holder" ng-show="response && response.correctness === \'warning\'">',
      '  <div class="empty-response">',
      '    <span class="empty-response-icon">',
      '      <svg-icon category="feedback" key="nothing-submitted" icon-set="{{iconset}}"></svg-icon>',
      '    </span>',
      '    <span class="empty-response-label">{{feedback && feedback.message ? feedback.message : \'Error\'}}</span>',
      '  </div>',
      '</div>'
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
      '  <div ng-repeat="r in rationales">',
      '    <label class="choice-letter" ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '    <span class="choice-label" ng-bind-html-unsafe="r.rationale"></span>',
      '  </div>',
      '</div>'
    ].join('');

    var choicesTemplate = [
      '<div class="choices-container">',
      '  <div ng-class="{showToggle: response && response.correctness == \'incorrect\' && question.config.showCorrectAnswer !== \'inline\'}" icon-toggle icon-name="correct" class="icon-toggle-correct" ng-model="bridge.answerVisible" closed-label="Show Correct Answer" open-label="Show My Answer"></div>',
      '  <div ng-repeat="o in choices" class="choice-holder-background {{question.config.orientation}} {{question.config.choiceStyle}}" ',
      '       ng-click="onClickChoice(o)" ng-class="choiceClass(o)">',
      '    <div class="choice-holder" >',
      '      <div class="choice-feedback" ng-if="mode !== \'instructor\'" feedback-icon feedback-icon-choice="o" feedback-icon-class="{{choiceClass(o)}}" feedback-icon-type="{{question.config.choiceType}}" feedback-icon-set="{{iconset}}"/>',
      '      <span class="choice-input" ng-switch="inputType">',
      '        <div class="checkbox-choice" ng-switch-when="checkbox" ng-disabled="!editable" ng-value="o.value">',
      '          <div mc-checkbox checkbox-button-state="{{radioState(o)}}" checkbox-button-choice="o" />',
      '        </div>',
      '        <div class="radio-choice" ng-switch-when="radio" ng-disabled="!editable" ng-value="o.value">',
      '          <div radio-button radio-button-state="{{radioState(o)}}" radio-button-choice="o" />',
      '        </div>',
      '      </span>',
      '      <label class="choice-letter" ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '      <label class="choice-currency-symbol"  ng-show="o.labelType == \'currency\'">$</label>',
      '      <div class="choice-label" ng-bind-html-unsafe="o.label"></div>',
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
        '<div class="view-multiple-choice" ng-class="interactionCorrectnessClass()">',
        choicesTemplate,
        rationalesTemplate,
        noResponseTemplate,
        learnMoreTemplate
      ].join("\n")

    };

    return def;
  }
];

var radioButton = ['$sce',
  function($sce) {
    return {
      scope: {
        radioButtonState: "@",
        radioButtonChoice: "="
      },
      template: [
        '<div class="radio-button" ng-class="{hasFeedback: feedback}">',
        '  <div class="choice-icon-holder" >',
        '    <choice-icon class="animate-show icon" ng-class="active" shape="radio" key="selected" ng-show="active == \'ready\' || active == \'selected\'"></choice-icon>',
        '    <choice-icon class="animate-hide icon" shape="radio" key="muted" ng-show="active == \'muted\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="radio" key="correct" ng-show="active == \'correct\' || active == \'correctUnselected\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="radio" key="incorrect" ng-show="active == \'incorrect\'"></choice-icon>',
        '  </div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {
        $scope.active = 'ready';

        $attrs.$observe('radioButtonState', function(val) {
          if (_(["selected", 'correct', 'incorrect', 'muted', 'correctUnselected']).contains(val)) {
            $scope.active = val;
            if (val == 'correctUnselected') {
              $scope.feedback = {
                correctness: 'correct',
                feedback: $scope.radioButtonChoice.feedback
              }
            } else {
              $scope.feedback = undefined;
            }
          } else {
            $scope.active = 'ready';
          }
        });
      }
    }
  }
];

var mcCheckbox = ['$sce',
  function($sce) {
    return {
      scope: {
        checkboxButtonState: "@",
        checkboxButtonChoice: "="
      },
      template: [
        '<div class="mc-checkbox" ng-class="{hasFeedback: feedback}">',
        '  <div class="choice-icon-holder" >',
        '    <choice-icon class="animate-show icon" ng-class="active" shape="box" key="selected" ng-show="active == \'ready\' || active == \'selected\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="box" key="muted" ng-show="active == \'muted\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="box" key="correct" ng-show="active == \'correct\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="box" key="correct" ng-show="active == \'correctUnselected\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="box" key="incorrect" ng-show="active == \'incorrect\'"></choice-icon>',
        '  </div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {

        $scope.active = 'ready';

        $attrs.$observe('checkboxButtonState', function(val) {
          if (_(["selected", 'correct', 'incorrect', 'muted', 'correctUnselected']).contains(val)) {
            $scope.active = val;
            if (val == 'correctUnselected') {
              $scope.feedback = {
                correctness: 'correct',
                feedback: $scope.checkboxButtonChoice.feedback
              }
            } else {
              $scope.feedback = undefined;
            }
          } else {
            $scope.active = 'ready';
          }
        });
      }
    }
  }
];

var feedbackIcon = [
  '$sce', '$log',
  function($sce) {

    return {
      scope: {
        feedbackIconChoice: "=",
        feedbackIconClass: "@",
        feedbackIconType: "@",
        feedbackIconSet: "@"
      },
      template: [
        '<div class="feedback-icon" feedback-popover="feedback" feedback-popover-state="state" viewport="#{{playerId}}">',
        '  <svg-icon ng-class="{hasFeedback: feedback.feedback}" key="{{iconKey()}}" shape="{{iconShape()}}" icon-set="{{iconSet()}}" text="{{feedback.feedback}}" open="{{state == \'open\' ? \'true\' : undefined}}"></svg-icon>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {

        $scope.$watch('feedbackIconChoice', updateView, true);
        $attrs.$observe('feedbackIconClass', updateView);
        $attrs.$observe('feedbackIconType', updateView);
        $attrs.$observe('feedbackIconSet', updateView);

        $scope.playerId = (function() {
          return $element.closest('.player-body').attr('id');
        })();

        $scope.iconKey = function() {
          var iconClass = $attrs.feedbackIconClass;
          if (/incorrect/gi.test(iconClass)) {
            return 'incorrect';
          }
          if (/correct/gi.test(iconClass)) {
            return 'correct';
          }
          return "empty";
        };

        $scope.iconShape = function() {
          var iconType = $attrs.feedbackIconType;
          return iconType === 'checkbox' ? 'square' : 'round';
        };

        $scope.iconSet = function() {
          var iconSet = $attrs.feedbackIconSet;
          return iconSet;
        };


        function updateView() {
          if (_.isUndefined($scope.feedbackIconChoice) || _.isUndefined($scope.feedbackIconClass) || _.isUndefined($scope.feedbackIconType)) {
            return;
          }
          var iconSet = $scope.feedbackIconSet || 'emoji';
          var correctness = _.result($scope.feedbackIconClass.match(/correct|incorrect|partial/), "0");
          var selected = $scope.feedbackIconClass.match(/selected/);
          var feedbackSelector = $scope.feedbackIconChoice.feedback ? 'feedback' : 'nofeedback';
          var correctnessSelector = (correctness == 'correct' && selected) ? 'correctSelected' : correctness;

          $scope.feedback = (!$scope.feedbackIconChoice.feedback || correctnessSelector == 'correct' ) ? undefined : {
            correctness: correctness,
            feedback: $scope.feedbackIconChoice.feedback
          };

        }
      }
    }

  }
];

var iconToggle = ['$sce',
  function($sce) {
    return {
      scope: {
        ngModel: "=",
        iconName: "@",
        label: "@",
        closedLabel: "@",
        openLabel: "@"
      },
      transclude: true,
      template: [
        '<div>',
        '  <a ng-click="toggleCorrect()" class="icon-toggle">',
        '    <div class="icon-holder">',
        '      <div class="icon-inner-holder">',
        '        <svg-icon class="toggle-icon show-state" ng-if="!ngModel" category="showHide" key="show-{{iconName}}"></svg-icon>',
        '        <svg-icon class="toggle-icon hide-state" ng-if="ngModel" category="showHide" key="hide-{{iconName}}"></svg-icon>',
        '      </div>',
        '    </div>',
        '    <span class="toggle-label" ng-bind-html-unsafe="currentLabel"></span>',
        '  </a>',
        '  <div ng-show="ngModel" ng-transclude></div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {

        $scope.ngModel = _.isUndefined($scope.ngModel) ? false : $scope.ngModel;
        $scope.currentLabel = $scope.ngModel ? ($scope.openLabel || $scope.label) : ($scope.closedLabel || $scope.label);

        $scope.$watch('ngModel', function() {
          $scope.currentLabel = $scope.ngModel ? ($scope.openLabel || $scope.label) : ($scope.closedLabel || $scope.label);
        });

        $scope.toggleCorrect = function() {
          $scope.ngModel = !$scope.ngModel;
        };

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
    name: 'feedbackIcon',
    directive: feedbackIcon
  },
  {
    name: 'radioButton',
    directive: radioButton
  },
  {
    name: 'mcCheckbox',
    directive: mcCheckbox
  },
  {
    name: 'iconToggle',
    directive: iconToggle
  }

];
