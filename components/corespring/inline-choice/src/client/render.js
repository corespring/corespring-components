var link, main;

link = function ($sce, $timeout) {
  return function (scope, element, attrs) {

    scope.answer = {
      choice: ""
    };


    scope.containerBridge = {

      setDataAndSession: function (dataAndSession) {
        scope.question = dataAndSession.data.model;
        var shuffleFn = (scope.question.config.shuffle) ? _.shuffle : _.identity;


        scope.choices = shuffleFn(_.cloneDeep(scope.question.choices));


        if (dataAndSession.session && dataAndSession.session.answers) {
          var selectedChoice = _.find(scope.choices, function (c) {
            return c.value == dataAndSession.session.answers;
          });
          scope.answer.choice = selectedChoice;
        }

      },

      getSession: function () {
        var answer = scope.answer ? scope.answer.choice.value : null;

        return {
          answers: answer,
          stash: {}
        };
      },

      setGlobalSession: function (session) {
        if (session) {
          scope.sessionFinished = session.isFinished;
        }
      },

      // sets the server's response
      setResponse: function (response) {
        _(scope.choices).each(function(c) {
          delete c.feedback;
          delete c.correct;
        });
        scope.response = response;
        console.log("set response for single-choice", response);
        if (response.feedback) {
          _.each(response.feedback, function (fb) {

            var choice = _.find(scope.choices, function (c) {
              return c.value === fb.value;
            });

            if (choice !== null) {
              choice.feedback = fb.feedback;
              choice.correct = fb.correct;
            }

            console.log("choice: ", choice);
          });
        }
      }
    };

    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

  };
};

main = [
  '$sce',
  '$timeout',
  function ($sce, $timeout) {
    var def;
    def = {
      scope: {},
      restrict: 'E',
      replace: true,
      link: link($sce, $timeout),
      template: [ '<div class="view-inline-choice">',
        '  <label ng-bind-html-unsafe="question.prompt"></label>',
        '  <div class="choices-container" >',
        '  <select ng-disabled="sessionFinished" ng-model="answer.choice" ng-options="c.label for c in choices" class="choice-holder"></select>',
        '  <div ng-show="answer.choice.feedback" class="tooltip" ng-class="{true:\'correct\', false:\'incorrect\'}[answer.choice.correct]">',
        '  <div class="tooltip-inner">',
        '    {{answer.choice.feedback}}',
        '  </div>',
        '  <div class="tooltip-arrow"></div>',
        '</div>',
        '</div>',
        '</div>'].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
