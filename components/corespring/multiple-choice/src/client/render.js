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
        var res = (isSelected) ? "selected " : "";

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
        if (scope.bridge.viewMode !== 'correct' && o.correct && !isSelected && scope.question.config.showCorrectAnswer !== "inline") {
          return scope.response ? "muted" : "";
        }
        if (o.correct) return "correct";
        if (!_.isUndefined(o.correct) && o.correct == false) return "incorrect";
        if (isSelected) return "selected";
        if (scope.response) return "muted";
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);
    };


    var verticalTemplate = [
      '<div class="choices-container">',
      '  <div icon-toggle icon-name="correct" class="icon-toggle-correct" ng-model="bridge.answerVisible" ng-show="response && response.correctness == \'incorrect\' && question.config.showCorrectAnswer !== \'inline\'"></div>',
      '  <div ng-repeat="o in choices" class="choice-holder-background {{question.config.orientation}} {{question.config.choiceStyle}}" ',
      '       ng-click="onClickChoice(o)" ng-class="choiceClass(o)">',
      '    <div class="choice-holder" >',
      '      <div class="choice-feedback" feedback-icon feedback-icon-choice="o" feedback-icon-class="{{choiceClass(o)}}" />',
      '      <span class="choice-input" ng-switch="inputType">',
      '        <div class="checkbox-choice" ng-switch-when="checkbox" ng-disabled="!editable" ng-value="o.value">',
      '          <div class="checkbox-button" />',
      '        </div>',

      '        <div class="radio-choice" ng-switch-when="radio" ng-disabled="!editable" ng-value="o.value">',
      '          <div radio-button radio-button-state="{{radioState(o)}}" />',
      '        </div>',
      '      </span>',
      '     <label class="choice-letter" ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '     <label class="choice-currency-symbol"  ng-show="o.labelType == \'currency\'">$</label>',
      '     <div class="choice-label" ng-bind-html-unsafe="o.label"></div>',
      '    </div>',
      '  </div>',
      '  <div class="rationale-expander" ng-show="rationales">',
      '    <div class="rationale-expander-row {{showHide[rationaleOpen.toString()]}}-state" ng-click="rationaleOpen = !rationaleOpen">',
      '      <span class="rationale-expander-{{showHide[rationaleOpen.toString()]}}"></span>',
      '      <span class="rationale-expander-label">Rationale</span>',
      '    </div>',
      '    <div class="rationale-body" ng-show="rationaleOpen">',
      '      <div ng-repeat="r in rationales">',
      '        <label class="choice-letter" ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '        <span class="choice-label" ng-bind-html-unsafe="r.rationale"></span>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div class="empty-response-holder" ng-show="response && response.correctness === \'warning\'">',
      '  <div class="empty-response">',
      '    <span class="empty-response-icon">',
      '      <svg viewBox="-125 129 36 32">',
      '      <polygon fill="#464146" points="-115.9,130 -124,138.1 -124,149.7 -115.9,158 -104.3,158 -96,149.7 -96,138.1 -104.3,130 				"/>',
      '      <path fill="#ffffff" d="M-107.6,150.2h-4.8c-0.8,0-1.4-0.6-1.4-1.4v0c0-0.8,0.6-1.4,1.4-1.4h4.8c0.8,0,1.4,0.6,1.4,1.4v0C-106.2,149.6-106.8,150.2-107.6,150.2z"/>',
      '      <rect x="-107.8" y="138.5" fill="#ffffff" width="3.5" height="4.4"/>',
      '      <rect x="-115.7" y="138.5" fill="#ffffff" width="3.5" height="4.4"/>',
      '      </svg>',
      '    </span>',
      '    <span class="empty-response-label">{{feedback && feedback.message ? feedback.message : \'Error\'}}</span>',
      '  </div>',
      '</div>'

    ].join("");

    def = {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: [
        '<div class="view-multiple-choice" ng-class="response.correctness">',
        verticalTemplate,
        //'  <div class="summaryFeedbackPanel fade in ng-hide" ng-show="response.comments">',
        //'    <div class="">',
        //'      <div class="panel-group">',
        //'        <div class="panel panel-default">',
        //'          <div class="panel-heading">',
        //'            <h4 class="panel-title">',
        //'              <a class="learn-more-link" ng-click="panelOpen = !panelOpen">',
        //'              <i class="learnMoreIcon fa fa-lightbulb-o"></i>Learn More',
        //'              </a>',
        //'            </h4>',
        //'          </div>',
        //'          <div class="panel-collapse collapse">',
        //'            <div class="panel-body" ng-bind-html-unsafe="response.comments"></div>',
        //'          </div>',
        //'        </div>',
        //'      </div>',
        //'    </div>',
        //'  </div>',
        '</div>'
      ].join("\n")

    };

    return def;
  }
];

var radioButton = ['$sce',
  function($sce) {
    return {
      scope: {
        radioButtonState: "@"
      },
      template: [
        '<div class="radio-button">',
        '  <div class="icon-holder" >',
        '    <div class="icon" ng-class="active" ng-if="active == \'ready\' || active == \'selected\'" ng-bind-html="glyphs[\'ready\']"></div>',
        '    <div class="icon" ng-if="active == \'muted\'" ng-bind-html="glyphs[active]"></div>',
        '    <div class="icon" ng-if="active == \'correct\'"  ng-bind-html="glyphs[active]"></div>',
        '    <div class="icon" ng-if="active == \'incorrect\'"  ng-bind-html="glyphs[active]"></div>',
        '  </div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {
        $scope.glyphs = _.mapValues({
          ready: [
            '<svg viewBox="0 0 31 31">',
            '<circle fill="#A2D4F2" cx="15.5" cy="15.5" r="15"/>',
            '<circle fill="#FFFFFF" cx="15.5" cy="15.5" r="13"/>',
            '<circle class="inner-circle" fill="#404B9B" cx="15.5" cy="15.5" r="8"/>',
            '</svg>'
          ].join(''),
          muted: [
            '<svg viewBox="0 0 31 31">',
            '<circle fill="#E0DEE0" cx="15.5" cy="15.5" r="15"/>',
            '<circle fill="#F8F6F6" cx="15.5" cy="15.5" r="13"/>',
            '</svg>'
          ].join(''),
          correct: [
            '<svg viewBox="-285 361 31 31">',
            '<circle fill="#86A785" cx="-269.5" cy="376.5" r="15"/>',
            '<circle fill="#C7E2C7" cx="-269.5" cy="376.5" r="13"/>',
            '<circle fill="#86A785" cx="-269.5" cy="376.5" r="8"/>'
          ].join(''),
          incorrect: [
            '<svg viewBox="-285 361 31 31">',
            '<circle fill="#BEBEBE" cx="-269.5" cy="376.5" r="15"/>',
            '<circle fill="#FFFFFF" cx="-269.5" cy="376.5" r="13"/>',
            '<circle fill="#BEBEBE" cx="-269.5" cy="376.5" r="8"/>'
          ].join(''),
          disabled: [].join('')
        }, function(o) {
          return $sce.trustAsHtml(o);
        });

        $scope.active = 'ready';

        $attrs.$observe('radioButtonState', function(val) {
          console.log("qqqq", val, val == 'selected');
          if (_(["selected",'correct','incorrect','muted']).contains(val)) {
            $scope.active = val;
          } else {
            $scope.active = 'ready';
          }
        });
      }
    }
  }
];

var iconToggle = ['$sce',
  function($sce) {
    return {
      scope: {
        ngModel: "=",
        iconName: "@"
      },
      template: [
        '<a ng-click="toggleCorrect()" class="icon-toggle">',
        '  <div class="icon-holder">',
        '    <span class="show-state" ng-if="active == \'show\'" ng-bind-html="glyphs[\'show-\'+iconName]"></span>',
        '    <span class="hide-state" ng-if="active == \'hide\'" ng-bind-html="glyphs[\'hide-\'+iconName]"></span>',
        '  </div>',
        '  <span class="toggle-label">{{showHide[active]}} correct answer</span>',
        '</a>'
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
          ].join('')
        }, function(o) {
          return $sce.trustAsHtml(o);
        });

        $scope.active = 'show';
        $scope.showHide = {show: 'Show', hide: 'Hide'};

        $scope.toggleCorrect = function() {
          $scope.active = $scope.active === 'show' ? 'hide' : 'show';
          $scope.ngModel = !$scope.ngModel;
        };

      }
    }
  }
];

var feedbackIcon = [
  '$sce', '$log',
  function($sce) {

    var glyphs = {
      empty: '<svg viewBox="0 0 31 31"></svg>',
      nonSelectedCorrect: [
        '<svg viewBox="0 0 31 31">',
        '<polygon fill="#2E662C" class="feedback-icon-foreground" points="15.4,22.7 8.6,16.8 11.2,13.8 14.3,16.5 18.9,8.3 22.4,10.2"/>',
        '</svg>'
      ].join(''),
      emoji: {
        nofeedback: {
          correct: [
            '<svg viewBox="-20 21 31 31">',
            '<circle fill="#C7E2C7" class="feedback-icon-background" cx="-4.5" cy="36.5" r="15"/>',
            '<path fill="#2E662C" class="feedback-icon-foreground" d="M1,39.5C-0.3,41.1-2.4,42-4.5,42c-2.1,0-4.2-1-5.5-2.5l-2.6,1.5c1.9,2.5,4.9,4,8.2,4c3.2,0,6.2-1.5,8.2-4L1,39.5z"/>',
            '<rect x="-2.3" y="30.9" fill="#2E662C" class="feedback-icon-foreground" width="3.5" height="4.4"/>',
            '<rect x="-10.2" y="30.9" fill="#2E662C" class="feedback-icon-foreground" width="3.5" height="4.4"/>',
            '</svg>'
          ].join(''),
          partial: [
            '<svg viewBox="-20 21 31 31">',
            '<circle fill="#C8E3E8" class="feedback-icon-background" cx="-4.5" cy="36.5" r="15"/>',
            '<rect x="-2.4" y="30.9" fill="#3A87AD" class="feedback-icon-foreground" width="3.5" height="4.4"/>',
            '<rect x="-10.2" y="30.9" fill="#3A87AD" class="feedback-icon-foreground" width="3.5" height="4.4"/>',
            '<rect x="-10.8" y="40.5" transform="matrix(0.9794 -0.2019 0.2019 0.9794 -8.5847 -5.393555e-02)" fill="#3A87AD" class="feedback-icon-foreground" width="12.5" height="3.2"/>',
            '</svg>'
          ].join(''),
          incorrect: [
            '<svg viewBox="-20 21 31 31">',
            '<circle fill="#FBE7B7" class="feedback-icon-background" cx="-4.5" cy="36.5" r="15"/>',
            '<rect x="-2.3" y="30.9" fill="#EEA236" class="feedback-icon-foreground" width="3.5" height="4.4"/>',
            '<rect x="-10.2" y="30.9" fill="#EEA236" class="feedback-icon-foreground" width="3.5" height="4.4"/>',
            '<rect x="-10.6" y="39.9" fill="#EEA236" class="feedback-icon-foreground" width="12.2" height="3.1"/>',
            '</svg>'
          ].join('')
        },
        feedback: {
          incorrect: [
            '<svg viewBox="-125 129 36 32">',
            '<path fill="#D0CAC5" d="M-91.5,146.2c0-7.7-6.3-14-14-14c-7.7,0-14,6.3-14,14c0,7.7,6.3,14,14,14c0.3,0,0.6,0,0.9,0v0h13.1l-4.5-3.8C-93.2,153.9-91.5,150.3-91.5,146.2z"/>',
            '<path fill="#B3ABA4" d="M-93.3,145.4c0-7.7-6.3-14-14-14c-7.7,0-14,6.3-14,14c0,7.7,6.3,14,14,14c0.3,0,0.6,0,0.9,0v0h13.1l-4.5-3.8C-95,153.1-93.3,149.5-93.3,145.4z"/>',
            '<path fill="#FBE7B7" class="feedback-icon-background" d="M-95.3,143.8c0-7.7-6.3-14-14-14c-7.7,0-14,6.3-14,14c0,7.7,6.3,14,14,14c0.3,0,0.6,0,0.9,0v0h13.1l-4.5-3.8C-97,151.4-95.3,147.8-95.3,143.8z"/>',
            '<rect x="-107.3" y="138.6" fill="#EEA236" class="feedback-icon-foreground" width="3.3" height="4.1"/>',
            '<rect x="-114.6" y="138.6" fill="#EEA236" class="feedback-icon-foreground" width="3.3" height="4.1"/>',
            '<rect x="-115" y="147" fill="#EEA236" class="feedback-icon-foreground" width="11.4" height="2.9"/>',
            '</svg>'
          ].join(''),
          correct: [
            '<svg viewBox="-125 129 36 32">',
            '<path fill="#D0CAC5" d="M-91.8,146.2c0-7.7-6.3-14-14-14c-7.7,0-14,6.3-14,14c0,7.7,6.3,14,14,14c0.3,0,0.6,0,0.9,0v0h13.1l-4.5-3.8C-93.5,153.9-91.8,150.3-91.8,146.2z"/>',
            '<path fill="#B3ABA4" class="st1" d="M-93.6,145.4c0-7.7-6.3-14-14-14c-7.7,0-14,6.3-14,14c0,7.7,6.3,14,14,14c0.3,0,0.6,0,0.9,0v0h13.1l-4.5-3.8C-95.3,153.1-93.6,149.5-93.6,145.4z"/>',
            '<path fill="#C7E2C7" class="feedback-icon-background" d="M-95.3,143.8c0-7.7-6.3-14-14-14c-7.7,0-14,6.3-14,14c0,7.7,6.3,14,14,14c0.3,0,0.6,0,0.9,0v0h13.1l-4.5-3.8C-97,151.4-95.3,147.8-95.3,143.8z"/>',
            '<path fill="#2E662C" class="feedback-icon-foreground" d="M-104.1,146.5c-1.3,1.5-3.2,2.4-5.2,2.4c-2,0-3.9-0.9-5.2-2.4l-2.4,1.4c1.8,2.3,4.6,3.8,7.6,3.8c3,0,5.8-1.4,7.6-3.8L-104.1,146.5z"/>',
            '<rect x="-107.3" y="138.6" fill="#2E662C" class="feedback-icon-foreground" width="3.3" height="4.1"/>',
            '<rect x="-114.6" y="138.6" fill="#2E662C" class="feedback-icon-foreground" width="3.3" height="4.1"/>',
            '</svg>'
          ].join('')
        }
      }
    };

    return {
      scope: {
        feedbackIconChoice: "=",
        feedbackIconClass: "@"
      },
      template: [
        '<div class="feedback-icon" ng-class="{hasFeedback: feedback}" feedback-popover="feedback" viewport="#{{playerId}}">',
        '  <div ng-if="!isEmpty" class="glyph" ng-bind-html="glyph"></div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {

        $scope.$watch('feedbackIconChoice', updateView, true);
        $attrs.$observe('feedbackIconClass', updateView);

        $scope.playerId = (function() {
          return $element.closest('.player-body').attr('id');
        })();


        function updateView() {
          console.log($scope.feedbackIconChoice, " ", $scope.feedbackIconClass);
          if (_.isUndefined($scope.feedbackIconChoice) || _.isUndefined($scope.feedbackIconClass)) {
            return;
          }
          var correctness = _.result($scope.feedbackIconClass.match(/correct|incorrect|partial/), "0");
          var selected = $scope.feedbackIconClass.match(/selected/);
          var feedbackSelector = $scope.feedbackIconChoice.feedback ? 'feedback' : 'nofeedback';

          $scope.isEmpty = true;
          if (correctness == 'correct' && !selected) {
            $scope.glyph = $sce.trustAsHtml($scope.feedbackIconChoice.feedback ? glyphs.emoji[feedbackSelector][correctness] : glyphs.nonSelectedCorrect);
            $scope.isEmpty = false;
          } else {
            if (glyphs.emoji[feedbackSelector][correctness]) {
              $scope.glyph = $sce.trustAsHtml(glyphs.emoji[feedbackSelector][correctness]);
              $scope.isEmpty = false;
            }
          }

          $scope.feedback = $scope.glyph == glyphs.empty ? undefined : {
            correctness: correctness,
            feedback: $scope.feedbackIconChoice.feedback
          };

        }
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
    name: 'iconToggle',
    directive: iconToggle
  }

];
