exports.framework = 'angular';
exports.directive = [
  '$sce', '$log',

  function($sce, $log) {

    return {
      scope: {},
      restrict: 'EA',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {

      var MAX_CHOICES_PER_ROW = 5;

      scope.inputType = 'checkbox';
      scope.editable = true;
      scope.answer = {
        choices: {}
      };

      scope.containerBridge = {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        setResponse: setResponse,
        setInstructorData: setInstructorData,
        setMode: setMode,
        reset: reset,
        isAnswerEmpty: isAnswerEmpty,
        answerChangedHandler: answerChangedHandler,
        editable: setEditable
      };

      scope.getRows = getRows;
      scope.getChoicesForRow = getChoicesForRow;
      scope.getChoiceClass = getChoiceClass;
      scope.toggleChoice = toggleChoice;
      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);

      //------------------------------------------------------------------------

      function getAnswers() {
        function isTrue(k) {
          return scope.answer.choices[k] === true;
        }
        var allKeys = _.keys(scope.answer.choices);
        var keys = _.filter(allKeys, isTrue);
        return keys;
      }

      function applyChoices() {
        if (!scope.question || !scope.session.answers) {
          return;
        }

        var answers = scope.session.answers;
        for (var i = 0; i < answers.length; i++) {
          var key = answers[i];
          scope.answer.choices[key] = true;
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

      function layoutChoices(choices, order) {
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
      }

      function stashOrder(choices) {
        return _.map(choices, function(c) {
          return c.value;
        });
      }

      function updateUi() {
        if (!scope.question || !scope.session) {
          return;
        }

        resetChoices();

        var model = scope.question;
        var stash = scope.session.stash = scope.session.stash || {};
        var answers = scope.session.answers = scope.session.answers || {};

        scope.inputType = !!model.config.singleChoice ? "radio" : "checkbox";

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
      }

      function setDataAndSession(dataAndSession) {
        $log.debug("focus-task setDataAndSession", dataAndSession);
        scope.question = dataAndSession.data.model;
        scope.session = dataAndSession.session || {};
        scope.itemShape = dataAndSession.data.model.config.itemShape || "circle";
        updateUi();
      }

      function getSession() {
        var stash = (scope.session && scope.session.stash) ? scope.session.stash : {};

        return {
          answers: getAnswers(),
          stash: stash
        };
      }

      // sets the server's response
      function setResponse(response) {
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
      }

      function setInstructorData(data) {
        _.each(scope.choices, function(c) {
          var isCorrect = _.contains(data.correctResponse.value, c.value);
          c.correct = isCorrect ? "shouldHaveBeenSelected" : undefined;
        });
      }

      function setMode(newMode) {}

      /**
       * Reset the ui back to an unanswered state
       */
      function reset() {
        resetChoices();
        resetFeedback(scope.choices);
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

      function getRows() {
        var numRows = scope.choices ? scope.choices.length / MAX_CHOICES_PER_ROW : 0;
        return _.range(numRows);
      }

      function getChoicesForRow(row) {
        return scope.choices.slice(
          row * MAX_CHOICES_PER_ROW,
          row * MAX_CHOICES_PER_ROW + MAX_CHOICES_PER_ROW);
      }

      function getChoiceClass(o) {
        var cl = scope.itemShape + " ";
        if (scope.answer.choices[o.value]) {
          cl += "selected ";
        }
        if (o.correct) {
          cl += o.correct;
        }
        return cl;
      }

      function toggleChoice(choice) {
        if (scope.editable) {
          scope.answer.choices[choice.value] = !scope.answer.choices[choice.value];
        }
      }
    }

    function template() {
      return [
        '<div>',
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
      ].join("\n");
    }
  }
];