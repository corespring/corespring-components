var link, main;

link = function($sce) {
  return function(scope, element, attrs) {


    console.log("> Player on scope: ", scope.player);

    scope.inputType = 'checkbox';
    scope.answer = {
      choices: {}
    };

    scope.$watch('session', function(newValue) {
      if (_.isUndefined(newValue)) {
        return;
      }
      scope.sessionFinished = newValue.isFinished;
    }, true);

    scope.$watch('question.config.singleChoice', function(newValue) {
      scope.inputType = !!newValue ? "radio" : "checkbox";
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


    //TODO: Reset a function exposed in the bridge?
    resetFeedback = function(choices){
      console.log("choices: ", choices);
      _.each(choices, function(c){
        delete c.feedback;
        delete c.correct;
      });
    }

    scope.containerBridge = {

      setModel: function(model) {
        scope.question = model;

        scope.inputType = !!model.config.singleChoice ? "radio" : "checkbox";

        if (scope.question.config.shuffle)
          scope.choices = _.shuffle(_.cloneDeep(scope.question.choices));
        else
          scope.choices = _.cloneDeep(scope.question.choices);

        updateChoice();
      },

      // sets the student's answer
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
        scope.session = session;
      },

      // sets the server's response
      setResponse: function(response) {
        console.log( scope.$id, "set response for multiple-choice", response);
        console.log( scope.$id, "choices", scope.choices);

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
      }
    };

    if(!scope.registerComponent){
      throw new Error("registerComponent isn't available on the scope");
    }
    scope.registerComponent(attrs.id, scope.containerBridge);
  };
};

main = [
  '$sce', function($sce) {
    var def;
    def = {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: link($sce),
      template: [ '<div class="view-multiple-choice">',
                  '  <label ng-bind-html-unsafe="question.prompt"></label>',
                  '  <div class="choices-container" ng-class="question.config.orientation">',
                  '  <div ng-repeat="o in choices" class="choice-holder" ng-class="question.config.orientation">',
                  '    <span ng-switch="inputType">',
                  '      <input ng-switch-when="checkbox" type="checkbox" ng-disabled="sessionFinished" name="group" ng-value="o.label" ng-model="answer.choices[o.value]"></input>',
                  '      <input ng-switch-when="radio" type="radio" ng-disabled="sessionFinished" name="group" ng-value="o.value" ng-model="answer.choice"></input>',
                  '    </span>',
                  '    <label ng-switch="o.labelType">',
                  '      <img class="choice-image" ng-switch-when="image" ng-src="{{o.imageName}}"></img>',
                  '      <span ng-switch-default>{{o.label}}</span>',
                  '    </label>',
                  '    <span class="cs-feedback" ng-class="{true:\'correct\', false:\'incorrect\'}[o.correct]" ng-show="o.feedback != null">{{o.feedback}}</span>',
                  '  </div>',
                  '</div>',
                  '</div>'].join("\n")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;

