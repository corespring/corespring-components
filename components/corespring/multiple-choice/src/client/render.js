var link, main;

link = function($sce) {
  return function(scope, element, attrs) {

    scope.inputType = 'checkbox';

    scope.answer = {
      choices: {}
    };

    //TODO - globalSession watcher instead?
    /*scope.$watch('session', function(newValue) {
      if (_.isUndefined(newValue)) {
        return;
      }
      scope.sessionFinished = newValue.isFinished;
    }, true);
    */
    //TODO: Necessary in player?
    /*scope.$watch('question.config.singleChoice', function(newValue) {
      scope.inputType = !!newValue ? "radio" : "checkbox";
    });*/

    var getAnswers = function(){
      if (scope.answer.choice) {
        return [scope.answer.choice];
      } else {
        var isTrue = function(k){ return scope.answer.choices[k] === true;};
        var allKeys = _.keys(scope.answer.choices);
        var keys = _.filter(allKeys, isTrue);
        return keys;
      }
    };

    var applyChoices = function(){

      if(!scope.question || !scope.session.answers){
        return;
      }

      var answers = scope.session.answers;

      if( scope.inputType == "radio"){
        scope.answer.choice = answers[0];
      } else {
        for (var i = 0; i < answers.length; i++) {
          var key = answers[i];
          scope.answer.choices[key] = true;
        }
      }
    };

    //TODO: Reset a function exposed in the bridge?
    var resetFeedback = function(choices){
      console.log("choices: ", choices);
      _.each(choices, function(c){
        delete c.feedback;
        delete c.correct;
      });
    };

    var layoutChoices = function(choices, order){
      if(!order){
        var shuffled = _.shuffle(_.cloneDeep(choices));
        return shuffled;
      } else {
        var ordered = _.map(order, function(v){
          return _.find(choices, function(c){
            return c.value == v;
          });
        });

        var missing = _.difference(choices, ordered)
        return _.union(ordered, missing);
      }
    };

    var stashOrder = function(choices) {
      return _.map(choices, function(c){
        return c.value;
      });
    };

    var updateUi = function(){

      if(!scope.question || !scope.session) {
        return;
      }

      var model = scope.question;
      var stash = scope.session.stash = scope.session.stash || {};
      var answers = scope.session.answers = scope.session.answers || {};

      scope.inputType = !!model.config.singleChoice ? "radio" : "checkbox";

      if(stash.shuffledOrder && model.config.shuffle){
        scope.choices = layoutChoices(model.choices, stash.shuffledOrder)
      } else if(model.config.shuffle) {
        scope.choices = layoutChoices(model.choices)
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
        scope.session = dataAndSession.session || {};
        updateUi();
      },

      getSession: function() {
        return {
          answers: getAnswers(),
          stash: scope.session.stash
        };
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

    scope.$emit('registerComponent', attrs.id, scope.containerBridge);
  };
};

main = [
  '$sce', function($sce) {
    var def;
    def = {
      scope: {},
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

