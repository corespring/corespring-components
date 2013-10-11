var componentDefinition, link, main;

link = function(CorespringContainer, $sce) {
  return function(scope, element, attrs) {

    scope.inputType = 'checkbox';
    scope.answer = {
      choices: {}
    };

    scope.$watch('session', function(newValue) {
      if (newValue == null) {
        return;
      }
      return scope.sessionFinished = newValue.isFinished;
    }, true);

    scope.$watch('question.config.singleChoice', function(newValue) {
      return scope.inputType = !!newValue ? "radio" : "checkbox";
    });


    var rawAnswer = null;

    var updateChoice = function(){

      if(!scope.question || !rawAnswer){
        return;
      }

      if( scope.inputType == "radio"){
        scope.answer.choice = rawAnswer[0];
      } else {
        var _i, _len;
        for (_i = 0, _len = rawAnswer.length; _i < _len; _i++) {
          var key = rawAnswer[_i];
          scope.answer.choices[key] = true;
        }
      }
    };

    scope.containerBridge = {

      setModel: function(model) {
        scope.question = model;
        scope.inputType = !!model.config.singleChoice ? "radio" : "checkbox";
        updateChoice();
      },

      setAnswer: function(answer) {
        rawAnswer = answer;
        updateChoice();
      },

      getAnswer: function() {
        var key, out, selected, _ref;
        out = [];
        if (scope.answer.choice) {
          out.push(scope.answer.choice);
        } else {
          _ref = scope.answer.choices;
          for (key in _ref) {
            selected = _ref[key];
            if (selected) {
              out.push(key);
            }
          }
        }
        return out;
      },

      setSession: function(session) {
        return scope.session = session;
      },

      setResponse: function(response) {
        scope.response = response;
        console.log("set response for single-choice", response);
        if (response.feedback) {
          _.each(response.feedback, function(fb) {

            var choice = _.find(scope.question.choices, function(c) {
              return c.value === fb.value;
            });

            if (choice != null) {
              choice.feedback = fb.feedback;
              choice.correct = fb.correct;
            }
            console.log("choice: ", choice);
          });
        }
      }
    };

    CorespringContainer.register(attrs['id'], scope.containerBridge);
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
      template: [ '<div class="view-single-choice">',
                  '  <label ng-bind-html-unsafe="question.prompt"></label>',
                  '  <div ng-repeat="o in question.choices">',
                  '    <label>{{o.label}}</label>',
                  '    <span ng-switch="inputType">',
                  '      <input ng-switch-when="checkbox" type="checkbox" ng-disabled="sessionFinished" name="group" ng-value="o.label" ng-model="answer.choices[o.value]"></input>',
                  '      <input ng-switch-when="radio" type="radio" ng-disabled="sessionFinished" name="group" ng-value="o.value" ng-model="answer.choice"></input>',
                  '    </span>',
                  '    <span class="cs-feedback" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]" ng-show="o.feedback">{{o.feedback}}</span>',
                  '  </div>',
                  '</div>'].join("\n")
    };

    return def;
  }
];

componentDefinition = {
  framework: 'angular',
  directive: main
};
