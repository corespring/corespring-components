var link, main;

link = function($sce, $timeout) {
  return function(scope, element, attrs) {

    scope.answer = {
      choice: ""
    };

    scope.containerBridge = {

      setDataAndSession: function(dataAndSession){
        scope.question = dataAndSession.data.model;
        var shuffleFn = (scope.question.config.shuffle) ? _.shuffle : _.identity;
        scope.choices = shuffleFn(_.cloneDeep(scope.question.choices));

        if(dataAndSession.session){
          $timeout( function(){
            scope.answer.choice = dataAndSession.session.answer;
          });
        }
      },

      getSession: function() {
        return {
          answer: scope.answer.choice,
          stash: {}
        };
      },

      setGlobalSession: function(session){
        if (session) {
          scope.sessionFinished = session.isFinished;
        };
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

    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

  };
};

main = [
  '$sce',
  '$timeout',
  function($sce, $timeout) {
    var def;
    def = {
      scope: {},
      restrict: 'E',
      replace: true,
      link: link($sce, $timeout),
      template: [ '<div class="view-multiple-choice">',
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

exports.framework = 'angular';
exports.directive = main;
