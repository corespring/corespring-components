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

        setDataAndSession: function(dataAndSession) {
          scope.question = dataAndSession.data.model;
          scope.question.config = _.defaults(scope.question.config || {}, {"showCorrectAnswer": "separately"});
          scope.session = dataAndSession.session || {};
          scope.answer = {
            choices: {},
            choice: ""
          };
          scope.iconset = scope.question.config.choiceType == 'checkbox' ? 'emoji' : 'check';
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

      scope.choiceClass = function(o) {
        var isSelected = (scope.answer.choice === o.value || scope.answer.choices[o.value]);
        var isCorrect = !_.isUndefined(o.correct) && o.correct;
        var res = (isSelected) ? "selected " : "";

        if (isCorrect && scope.mode == 'instructor') {
          return "correct";
        }

        if (_.isUndefined(o.correct)) {
          return res + "default";
        }

        if (scope.bridge.viewMode !== 'correct' && o.correct && !isSelected && scope.question.config.showCorrectAnswer !== "inline") {
          return "";
        }

        return res + (o.correct ? 'correct' : 'incorrect');
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
        if (!_.isUndefined(o.correct) && o.correct == false) return "incorrect";
        if (isSelected) return isCorrect ? "correct" : "selected";
        if (!_.isUndefined(o.correct) && o.correct == true) return isSelected ? "correct" : "correctUnselected";
        if (scope.response) return "muted";
      };


      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);
    };


    var noResponseTemplate = [
      '<div class="empty-response-holder" ng-show="response && response.correctness === \'warning\'">',
      '  <div class="empty-response">',
      '    <span class="empty-response-icon">',
      '      <svg viewBox="-125 129 36 32">',
      '      <polygon fill="#384599" points="-115.9,130 -124,138.1 -124,149.7 -115.9,158 -104.3,158 -96,149.7 -96,138.1 -104.3,130 				"/>',
      '      <path fill="#ffffff" d="M-107.6,150.2h-4.8c-0.8,0-1.4-0.6-1.4-1.4v0c0-0.8,0.6-1.4,1.4-1.4h4.8c0.8,0,1.4,0.6,1.4,1.4v0C-106.2,149.6-106.8,150.2-107.6,150.2z"/>',
      '      <rect x="-107.8" y="138.5" fill="#ffffff" width="3.5" height="4.4"/>',
      '      <rect x="-115.7" y="138.5" fill="#ffffff" width="3.5" height="4.4"/>',
      '      </svg>',
      '    </span>',
      '    <span class="empty-response-label">{{feedback && feedback.message ? feedback.message : \'Error\'}}</span>',
      '  </div>',
      '</div>'
    ].join('');

    var learnMoreTemplate = [
      '<div ng-if="response.comments">',
      '  <div icon-toggle icon-name="learnMore" class="icon-toggle-learnMore" ng-model="bridge.learnMoreOpen" label="Learn more">',
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
      //'  <div><input type="radio" ng-model="iconset" value="emoji"/>Emoji     &nbsp;&nbsp;&nbsp;<input type="radio" ng-model="iconset" value="check"/>Check </div>',
      '  <div icon-toggle icon-name="correct" class="icon-toggle-correct" ng-model="bridge.answerVisible" closed-label="Show correct Answer" open-label="Hide correct answer" ng-show="response && response.correctness == \'incorrect\' && question.config.showCorrectAnswer !== \'inline\' && question.config.choiceType == \'checkbox\'"></div>',
      '  <div ng-repeat="o in choices" class="choice-holder-background {{question.config.orientation}} {{question.config.choiceStyle}}" ',
      '       ng-click="onClickChoice(o)" ng-class="choiceClass(o)">',
      '    <div class="choice-holder" >',
      '      <div class="choice-feedback" feedback-icon feedback-icon-choice="o" feedback-icon-class="{{choiceClass(o)}}" feedback-icon-type="{{question.config.choiceType}}" feedback-icon-set="{{iconset}}"/>',
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
      '  <div icon-toggle icon-name="correct" class="icon-toggle-correct-two" closed-label="Show correct answer" open-label="Hide correct answer" ng-model="bridge.answerVisible" ng-show="response && response.correctness == \'incorrect\' && question.config.showCorrectAnswer !== \'inline\' && question.config.choiceType == \'radio\'"></div>',
      '</div>'
    ].join("");

    def = {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: [
        '<div class="view-multiple-choice" ng-class="response.correctness">',
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
        '<div class="radio-button" ng-class="{hasFeedback: feedback}" feedback-popover="feedback">',
        '  <div class="choice-icon-holder" >',
        '    <choice-icon class="icon" ng-class="active" shape="radio" key="selected" ng-if="active == \'ready\' || active == \'selected\'"></choice-icon>',
        '    <choice-icon class="icon" shape="radio" key="muted" ng-if="active == \'muted\'"></choice-icon>',
        '    <choice-icon class="icon" shape="radio" key="correct" ng-if="active == \'correct\'"></choice-icon>',
        '    <choice-icon class="icon" shape="radio" key="incorrect" ng-if="active == \'incorrect\'"></choice-icon>',
        '  </div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {
        $scope.active = 'ready';

        $attrs.$observe('radioButtonState', function(val) {
          console.log("qqqq", val, val == 'selected');
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
        '<div class="mc-checkbox" ng-class="{hasFeedback: feedback}" feedback-popover="feedback">',
        '  <div class="choice-icon-holder" >',
        '    <choice-icon class="icon" ng-class="active" shape="box" key="selected" ng-if="active == \'ready\' || active == \'selected\'"></choice-icon>',
        '    <choice-icon class="icon" shape="box" key="muted" ng-if="active == \'muted\'"></choice-icon>',
        '    <choice-icon class="icon" shape="box" key="correct" ng-if="active == \'correct\'"></choice-icon>',
        '    <choice-icon class="icon" shape="box" key="incorrect" ng-if="active == \'incorrect\'"></choice-icon>',
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
        '  <svg-icon key="{{iconKey()}}" shape="{{iconShape()}}" icon-set="{{iconSet()}}" text="{{feedback.feedback}}" open="{{state == \'open\' ? \'true\' : undefined}}"></svg-icon>',
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
          return "";
        };

        $scope.iconShape = function() {
          var iconType = $attrs.feedbackIconType;
          return 'square';
        };

        $scope.iconSet = function() {
          var iconSet = $attrs.feedbackIconSet;
          return iconSet;
        };


        function updateView() {
          console.log($scope.feedbackIconChoice, " ", $scope.feedbackIconClass);
          if (_.isUndefined($scope.feedbackIconChoice) || _.isUndefined($scope.feedbackIconClass) || _.isUndefined($scope.feedbackIconType)) {
            return;
          }
          var iconSet = $scope.feedbackIconSet || 'emoji';
          var correctness = _.result($scope.feedbackIconClass.match(/correct|incorrect|partial/), "0");
          var selected = $scope.feedbackIconClass.match(/selected/);
          var feedbackSelector = $scope.feedbackIconChoice.feedback ? 'feedback' : 'nofeedback';
          var correctnessSelector = (correctness == 'correct' && selected) ? 'correctSelected' : correctness;
          $scope.isEmpty = false;
          console.log(iconSet, $scope.feedbackIconType, feedbackSelector, correctnessSelector);

          $scope.feedback = ($scope.isEmpty || !$scope.feedbackIconChoice.feedback || correctnessSelector == 'correct' ) ? undefined : {
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
        '        <span class="show-state" ng-if="!ngModel" ng-bind-html="glyphs[\'show-\'+iconName]"></span>',
        '        <span class="hide-state" ng-if="ngModel" ng-bind-html="glyphs[\'hide-\'+iconName]"></span>',
        '      </div>',
        '    </div>',
        '    <span class="toggle-label" ng-bind-html-unsafe="currentLabel"></span>',
        '  </a>',
        '  <div ng-show="ngModel" ng-transclude></div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {
        $scope.glyphs = _.mapValues({
          "show-correct": [
            '<svg viewBox="-129.5 127 34 35">',
            '<path style="fill:#D0CAC5;stroke:#E6E3E0;stroke-width:0.75;stroke-miterlimit:10;" d="M-112.9,160.4c-8.5,0-15.5-6.9-15.5-15.5c0-8.5,6.9-15.5,15.5-15.5s15.5,6.9,15.5,15.5C-97.4,153.5-104.3,160.4-112.9,160.4z"/>',
            '<path style="fill:#B3ABA4;stroke:#CDC7C2;stroke-width:0.5;stroke-miterlimit:10;" d="M-113.2,159c-8,0-14.5-6.5-14.5-14.5s6.5-14.5,14.5-14.5s14.5,6.5,14.5,14.5S-105.2,159-113.2,159z"/>',
            '<circle style="fill:#FFFFFF;" cx="-114.2" cy="143.5" r="14"/>',
            '<path style="fill:#BCE2FF;" d="M-114.2,158c-8,0-14.5-6.5-14.5-14.5s6.5-14.5,14.5-14.5s14.5,6.5,14.5,14.5S-106.2,158-114.2,158zM-114.2,130c-7.4,0-13.5,6.1-13.5,13.5s6.1,13.5,13.5,13.5s13.5-6.1,13.5-13.5S-106.8,130-114.2,130z"/>',
            '<polygon style="fill:#1A9CFF;" points="-114.8,150.7 -121.6,144.8 -119,141.8 -115.9,144.5 -111.3,136.3 -107.8,138.2 			"/>',
            '</svg>'
          ].join(''),
          "hide-correct": [
            '<svg viewBox="-283 359 34 35">',
            '<circle class="st0" fill="#BCE2FF" cx="-266" cy="375.9" r="14"/>',
            '<path class="st0" fill="#BCE2FF" d="M-280.5,375.9c0-8,6.5-14.5,14.5-14.5s14.5,6.5,14.5,14.5s-6.5,14.5-14.5,14.5S-280.5,383.9-280.5,375.9zM-279.5,375.9c0,7.4,6.1,13.5,13.5,13.5c7.4,0,13.5-6.1,13.5-13.5s-6.1-13.5-13.5-13.5C-273.4,362.4-279.5,368.5-279.5,375.9z" />',
            '<polygon class="st1" fill="#FFFFFF" points="-265.4,383.1 -258.6,377.2 -261.2,374.2 -264.3,376.9 -268.9,368.7 -272.4,370.6 				"/>',
            '</svg>'
          ].join(''),
          "show-learnMore": [
            '<svg viewBox="-135 129 16 31">',
            '<path fill="#D0CAC5" stroke="#E6E3E0" class="st0" d="M-120.7,142.4c0-3.7-3.3-6.6-7.1-5.8c-2.4,0.5-4.3,2.4-4.7,4.8c-0.4,2.3,0.6,4.4,2.2,5.7c0.4,0.3,0.6,0.8,0.6,1.3v1.9h6.1v-1.9c0-0.5,0.2-1,0.6-1.3C-121.6,146-120.7,144.3-120.7,142.4z"/>',
            '<path fill="#D0CAC5" stroke="#E6E3E0" class="st0" d="M-124.4,154.3h-4.5c-0.4,0-0.8-0.4-0.8-0.8v-1.6h6.1v1.6C-123.6,153.9-123.9,154.3-124.4,154.3z"/>',
            '<path fill="#B3ABA4" stroke="#CDC7C2" class="st1" d="M-121.3,141.8c0-3.7-3.3-6.6-7.1-5.8c-2.4,0.5-4.3,2.4-4.7,4.8c-0.4,2.3,0.6,4.4,2.2,5.7c0.4,0.3,0.6,0.8,0.6,1.3v1.9h6.1v-1.9c0-0.5,0.2-1,0.6-1.3C-122.2,145.3-121.3,143.7-121.3,141.8z"/>',
            '<path fill="#B3ABA4" stroke="#CDC7C2" class="st1" d="M-125,153.7h-4.5c-0.4,0-0.8-0.4-0.8-0.8v-1.6h6.1v1.6C-124.2,153.3-124.6,153.7-125,153.7z"/>',
            '<path fill="#1A9CFF" class="st2" d="M-122,141.1c0-3.7-3.3-6.6-7.1-5.8c-2.4,0.5-4.3,2.4-4.7,4.8c-0.4,2.3,0.6,4.4,2.2,5.7c0.4,0.3,0.6,0.8,0.6,1.3v1.9h6.1v-1.9c0-0.5,0.2-1,0.6-1.3C-122.8,144.7-122,143-122,141.1z"/>',
            '<path fill="#1A9CFF" class="st2" d="M-125.7,153h-4.5c-0.4,0-0.8-0.4-0.8-0.8v-1.6h6.1v1.6C-124.9,152.7-125.2,153-125.7,153z"/>',
            '<path fill="#BCE2FF" class="st3" d="M-130.4,142.1c0-2.1,1.7-3.9,3.9-3.9c0.3,0,0.5,0,0.8,0.1c-0.6-0.8-1.5-1.3-2.6-1.3c-1.8,0-3.3,1.5-3.3,3.3c0,1.1,0.5,2,1.3,2.6C-130.4,142.6-130.4,142.4-130.4,142.1z"/>',
            '</svg>'
          ].join(''),
          "hide-learnMore": [
            '<svg viewBox="-135 129 16 32">',
            '<path fill="#6696AF" class="st0" d="M-122,141.1c0-3.7-3.3-6.6-7.1-5.8c-2.4,0.5-4.3,2.4-4.7,4.8c-0.4,2.3,0.6,4.4,2.2,5.7c0.4,0.3,0.6,0.8,0.6,1.3v1.9h6.1v-1.9c0-0.5,0.2-1,0.6-1.3C-122.8,144.7-122,143-122,141.1z"/>',
            '<path fill="#6696AF" class="st0" d="M-125.7,153h-4.5c-0.4,0-0.8-0.4-0.8-0.8v-1.6h6.1v1.6C-124.9,152.7-125.2,153-125.7,153z"/>',
            '<path fill="#C8D4DE" class="st1" d="M-130.4,142.1c0-2.1,1.7-3.9,3.9-3.9c0.3,0,0.5,0,0.8,0.1c-0.6-0.8-1.5-1.3-2.6-1.3c-1.8,0-3.3,1.5-3.3,3.3c0,1.1,0.5,2,1.3,2.6C-130.4,142.6-130.4,142.4-130.4,142.1z"/>',
            '</svg>'
          ].join(''),
          "show-rationale": [
            '<svg viewBox="-129 128 34 34">',
            '<path style="fill:#D0CAC5;stroke:#E6E3E0;stroke-width:0.75;stroke-miterlimit:10;" d="M-111.7,160.9c-8.5,0-15.5-6.9-15.5-15.5c0-8.5,6.9-15.5,15.5-15.5s15.5,6.9,15.5,15.5C-96.2,154-103.1,160.9-111.7,160.9z"/>',
            '<path style="fill:#B3ABA4;stroke:#CDC7C2;stroke-width:0.5;stroke-miterlimit:10;" d="M-112,159.5c-8,0-14.5-6.5-14.5-14.5s6.5-14.5,14.5-14.5s14.5,6.5,14.5,14.5S-104,159.5-112,159.5z"/>',
            '<circle style="fill:#FFFFFF;" cx="-113" cy="144" r="14"/>',
            '<rect x="-115" y="136.7" style="fill:#1A9CFF;" width="3" height="3"/>',
            '<polygon style="fill:#1A9CFF;" points="-112,147.7 -112,141.7 -115.8,141.7 -115.8,143.7 -114,143.7 -114,147.7 -116.2,147.7-116.2,149.7 -109.8,149.7 -109.8,147.7 					"/>',
            '<path style="fill:#BCE2FF;" d="M-113,158.5c-8,0-14.5-6.5-14.5-14.5s6.5-14.5,14.5-14.5s14.5,6.5,14.5,14.5S-105,158.5-113,158.5zM-113,130.5c-7.4,0-13.5,6.1-13.5,13.5s6.1,13.5,13.5,13.5s13.5-6.1,13.5-13.5S-105.6,130.5-113,130.5z"/>',
            '</svg>'
          ].join(''),
          "hide-rationale": [
            '<svg viewBox="-129 128 34 34">',
            '<circle style="fill:#BCE2FF;" cx="-113" cy="144" r="14"/>',
            '<rect x="-115" y="136.7" style="fill:#1A9CFF;" width="3" height="3"/>',
            '<polygon style="fill:#1A9CFF;" points="-112,147.7 -112,141.7 -115.8,141.7 -115.8,143.7 -114,143.7 -114,147.7 -116.2,147.7-116.2,149.7 -109.8,149.7 -109.8,147.7 					"/>',
            '<path style="fill:#BCE2FF;" d="M-113,158.5c-8,0-14.5-6.5-14.5-14.5s6.5-14.5,14.5-14.5s14.5,6.5,14.5,14.5S-105,158.5-113,158.5zM-113,130.5c-7.4,0-13.5,6.1-13.5,13.5s6.1,13.5,13.5,13.5s13.5-6.1,13.5-13.5S-105.6,130.5-113,130.5z"/>',
            '</svg>'
          ].join('')
        }, function(o) {
          return $sce.trustAsHtml(o);
        });

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
