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

        resetChoices();
        $(element).find(".alert").hide();

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
        scope.$emit('rerender-math', {delay: 100});
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
          $(element).find(".alert").hide();

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
            });
          }
          setTimeout(function() {
            $(element).find(".alert.visible").slideDown(400);
          }, 10);
        },
        setMode: function(newMode) {},
        /**
         * Reset the ui back to an unanswered state
         */
        reset: function() {
          $(element).find(".alert").hide();
          resetChoices();
          resetFeedback(scope.choices);
          scope.response = undefined;
          scope.answerVisible = false;
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
          case "none": return "";
          case "numbers": return (idx+1)+"";
        }

        // default to letters
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

      function orientation(){
        return scope.question && scope.question.config ? scope.question.config.orientation : '';
      }

      scope.onClickChoice = function(choice){
        if(scope.editable) {
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

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };

    var verticalTemplate = [
      '<div class="choices-container" ng-class="question.config.orientation">',
      '  <div ng-repeat="o in choices" class="choice-holder-background {{question.config.orientation}} {{question.config.choiceStyle}}" ',
      '       ng-click="onClickChoice(o)" ng-class="{selected: answer.choice == o.value || answer.choices[o.value]}">',
      '    <div class="choice-holder" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]">',
      '      <span class="choice-input" ng-switch="inputType">',
      '        <div class="checkbox-choice" ng-switch-when="checkbox" ng-disabled="!editable" ng-value="o.value">',
      '          <div class="checkbox-button" ng-class="{selected: answer.choices[o.value]}" />',
      '        </div>',
      '        <div class="radio-choice" ng-switch-when="radio" ng-disabled="!editable" ng-value="o.value">',
      '          <div class="radio-button" ng-class="{selected: answer.choice == o.value}" />',
      '        </div>',
      '      </span>',

      '      <div>',

      '       <label class="choice-letter" ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '       <label class="choice-currency-symbol"  ng-show="o.labelType == \'currency\'">$</label>',
      '       <div class="choice-label" ng-switch="o.labelType">',
      '         <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
      '         <span ng-switch-default ng-bind-html-unsafe="o.label"></span>',
      '       </div>',
      '     </div>',
      '    </div>',
      '    <div class="choice-feedback-holder" ng-show="answer.choice == o.value || answer.choices[o.value]">',
      '      <div class="alert alert-{{o.correct ? \'success\' : \'warning\'}} fade in" ng-class="{visible: o.feedback}" style="display: none">',
      '        <span type="success" ng-bind-html-unsafe="o.feedback"></span>',
      '      </div>',
      '    </div>',
      '  </div>',

      '  <div ng-show="response && response.correctness != \'correct\'">',
      '    <a class="show-correct-answer" ng-click="answerVisible = !answerVisible">{{answerVisible ? \'Hide\' : \'See\' }} Correct Answer</a>',
      '  </div>',
      '  <div class="answer-holder" ng-if="answerVisible && response && response.correctness != \'correct\'">',
      '    <div ng-repeat="o in choices" class="choice-holder-background answer {{question.config.orientation}} {{question.config.choiceStyle}}" ',
      '         ng-click="onClickChoice(o)" ng-class="{true:\'correct\'}[o.correct]">',
      '      <div class="choice-holder" ng-class="{true:\'correct\'}[o.correct]">',
      '        <span class="choice-input" ng-switch="inputType">',
      '          <div class="checkbox-choice" ng-switch-when="checkbox" ng-disabled="!editable" ng-value="o.value">',
      '            <div class="checkbox-button" />',
      '          </div>',
      '          <div class="radio-choice" ng-switch-when="radio" ng-disabled="!editable" ng-value="o.value">',
      '            <div class="radio-button" />',
      '          </div>',
      '        </span>',
      '        <div>',
      '         <label class="choice-letter" ng-class="question.config.choiceLabels">{{letter($index)}}.</label>',
      '         <label class="choice-currency-symbol"  ng-show="o.labelType == \'currency\'">$</label>',
      '         <div class="choice-label" ng-switch="o.labelType">',
      '           <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
      '           <span ng-switch-default ng-bind-html-unsafe="o.label"></span>',
      '         </div>',
      '       </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("");

    var horizontalTemplate = [
      '<div class="choices-container" ng-class="question.config.orientation">',
      '  <div ng-repeat="o in choices" class="choice-holder {{question.config.orientation}} {{question.config.choiceStyle}}" ',
      '       ng-click="onClickChoice(o)" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]">',
      '    <div class="choice-wrapper">',
      '      <label class="choice-letter">{{letter($index)}}.</label>',
      '      <label class="choice-currency-symbol"  ng-show="o.labelType == \'currency\'">$</label>',
      '      <div class="choice-label" ng-switch="o.labelType">',
      '        <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}" />',
      '        <span ng-switch-when="mathml" ng-bind-html-unsafe="o.mathml"></span>',
      '        <span ng-switch-default ng-bind-html-unsafe="o.label"></span>',
      '      </div>',
      '      <div ng-switch="inputType">',
      '        <input ng-switch-when="checkbox" type="checkbox" ng-disabled="!editable"  ng-value="o.label" ng-checked="answer.choices[o.value]" />',
      '        <input ng-switch-when="radio" type="radio" ng-disabled="!editable" ng-value="o.value" ng-checked="answer.choice == o.value" />',
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
      '        <div class="cs-feedback" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]" ng-show="o.feedback != null"></div>',
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
        '  <div class="summaryFeedbackPanel fade in" ng-show="response.comments">',
        '    <div class="">',
        '      <div class="panel-group" id="accordion2">',
        '        <div class="panel panel-default">',
        '          <div class="panel-heading">',
        '            <h4 class="panel-title">',
        '              <a ng-click="panelOpen = !panelOpen">',
        '              Learn More<i class="learnMoreIcon fa fa-lightbulb-o pull-right"></i>',
        '              </a>',
        '            </h4>',
        '          </div>',
        '          <div class="panel-collapse collapse">',
        '            <div class="panel-body" ng-bind-html-unsafe="response.comments"></div>',
        '          </div>',
        '        </div>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("\n")

    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
