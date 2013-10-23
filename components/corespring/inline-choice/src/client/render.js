var componentDefinition, link, main;

link = function(CorespringContainer, $sce) {
  return function(scope, element, attrs) {

    scope.inputType = 'checkbox';
    scope.answer = {
      choice: ""
    };

    scope.$watch('session', function(newValue) {
      if (_.isUndefined(newValue)) {
        return;
      }
      scope.sessionFinished = newValue.isFinished;
    }, true);

    scope.containerBridge = {

      setModel: function(model) {
        scope.question = model;

        var shuffleFn = (scope.question.config.shuffle) ? _.shuffle : _.identity;

        scope.choices = shuffleFn(_.cloneDeep(scope.question.choices));
      },

      // sets the student's answer
      setAnswer: function(answer) {
        scope.answer.choice = answer;
        console.log("Set answer to ", answer);
      },

      getAnswer: function() {
        return scope.answer.choice;
      },

      setSession: function(session) {
        scope.session = session;
      },

      // sets the server's response
      setResponse: function(response) {
        scope.response = response;
        console.log("set response for single-choice", response);
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
      }
    };

     if(!scope.registerComponent){
      throw new Error("registerComponent isn't available on the scope");
    }
    scope.registerComponent(attrs.id, scope.containerBridge);

  };
};

main = [
  'CorespringContainer', '$sce', function(CorespringContainer, $sce) {
    var def;
    def = {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: link(CorespringContainer, $sce),
      template: [ '<div class="view-multiple-choice">{{answer.choice}}',
                  '  <label ng-bind-html-unsafe="question.prompt"></label>',
                  '  <div class="choices-container" >',
                  '  <select ng-model="answer.choice" class="choice-holder">',
                  '   <option ng-repeat="c in choices" value="{{c.value}}">{{c.label}}</option>',
                  '  </select>',
                  '</div>',
                  '</div>'].join("\n")
    };

    return def;
  }
];

componentDefinition = {
  framework: 'angular',
  directive: main
};
