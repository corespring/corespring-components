var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {

      scope.inputType = 'checkbox';
      scope.editable = true;
      scope.answer = {
        choices: {}
      };

      var getAnswers = function() {
        var isTrue = function(k) {
          return scope.answer.choices[k] === true;
        };
        var allKeys = _.keys(scope.answer.choices);
        var keys = _.filter(allKeys, isTrue);
        return keys;
      };

      var applyChoices = function() {
        if (!scope.question || !scope.session.answers) {
          return;
        }

        var answers = scope.session.answers;
        for (var i = 0; i < answers.length; i++) {
          var key = answers[i];
          scope.answer.choices[key] = true;
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
          });

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

        scope.inputType = !! model.config.singleChoice ? "radio" : "checkbox";

        if (stash.shuffledOrder && model.config.shuffle) {
          scope.choices = layoutChoices(model.choices, stash.shuffledOrder);
        } else if (model.config.shuffle) {
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
          $log.debug("multiple-choice setDataAndSession", dataAndSession);
          scope.question = dataAndSession.data.model;
          scope.session = dataAndSession.session || {};
          scope.itemShape = dataAndSession.data.model.config.itemShape || "circle";
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
          console.log(scope.$id, "set response for focus-task", response);
          console.log(scope.$id, "choices", scope.choices);

          resetFeedback(scope.choices);

          scope.response = response;
          _.each(response.feedback, function(v, k) {
            var choice = _.find(scope.choices, function(c) {
              return c.value === k;
            });

            if (choice !== null) {
              choice.correct = v;
            }
            console.log("choice: ", choice);
          });
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

      scope.getRows = function() {
        return _.range(scope.choices.length / 5);
      };

      scope.getChoicesForRow = function(row) {
        return scope.choices.slice(row * 5, row * 5 + 5);

      };

      scope.getChoiceClass = function(o) {
        var cl = scope.itemShape + " ";
        if (scope.answer.choices[o.value]) {
          cl += "selected ";
        }
        if (o.correct) {
          cl += o.correct;
        }
        return cl;
      };

      scope.toggleChoice = function(choice) {
        if (scope.editable) {
          scope.answer.choices[choice.value] = !scope.answer.choices[choice.value];
        }
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };


    def = {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: [
        '<div>',
        '  <span class="prompt" ng-bind-html-unsafe="question.prompt"></span>',
        '  <div class="focus-container">',
        '    <div ng-repeat="row in getRows()">',
        '      <div class="focus-row" ng-class="question.config.orientation">',
        '        <div class="inner">',
        '          <div ng-repeat="o in getChoicesForRow(row)" ng-click="toggleChoice(o)" enabled="{{editable}}" class="focus-element {{getChoiceClass(o)}}">',
        '            <span>{{o.label}}</span>',
        '           </div>',
        '         </div>',
        '       </div>',
        '     </div>',
        '  </div>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
