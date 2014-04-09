var link, main;

link = function() {
  return function(scope, element, attrs) {

    scope.editable = true;
    scope.containerBridge = {

      setDataAndSession: function(dataAndSession) {
        scope.question = dataAndSession.data.model;
        scope.session = dataAndSession.session || {};
        scope.answer = scope.session.answers;
      },

      getSession: function() {
        var answer = scope.answer;

        return {
          answers: answer,
          stash: scope.session.stash
        };
      },

      // sets the server's response
      setResponse: function(response) {
        console.log("Setting Response for text entry:");
        console.log(response);

        scope.feedback = response.feedback;
        scope.correctClass = response.feedback.correctness;
        scope.comments = response.comments;
      },

      setMode: function(newMode) {},

      reset: function() {
        scope.answer = undefined;
        scope.feedback = undefined;
        scope.correctClass = undefined;
        scope.response = undefined;
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

    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

  };
};

main = [

  function() {
    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [
        '<div class="cs-text-entry">',
        '  <div class="cs-text-entry__text-input-holder">',
        '    <input type="text" ng-model="answer" ng-disabled="!editable" ng-class="feedback.correctness"',
        '           class="cs-text-entry__text-input form-control text-input"/>',
        '  </div>',
        '  <div class="cs-text-entry__feedback-holder" ng-show="feedback != null">',
        '    <span class="cs-text-entry__feedback" ng-class="feedback.correctness" ng-show="feedback != null"></span>',
        '     {{feedback.message}}',
        '  </div>',
        '  <div ng-show="comments" class="well" ng-bind-html-unsafe="comments"></div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
