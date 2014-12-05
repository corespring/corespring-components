var link, main;
link = function() {
  return function(scope, element, attrs) {

    scope.editable = true;

    scope.question = {};
    scope.session = {};

    scope.answer = undefined;
    scope.feedback = undefined;
    scope.correctClass = undefined;
    scope.response = undefined;

    scope.containerBridge = {

      setDataAndSession: function(dataAndSession) {
        scope.question = dataAndSession.data.model;
        scope.session = dataAndSession.session || {};
        scope.answer = scope.session.answers;
      },

      getSession: function() {
        return {
          answers: scope.answer,
          stash: scope.session ? scope.session.stash : {}
        };
      },

      // sets the server's response
      setResponse: function(response) {
        var inputElement = $(element).find('input');
        inputElement.popover('destroy');
        if (!response) {
          return;
        }

        scope.response = response;
        scope.feedback = response.feedback;
        scope.correctClass = response.feedback && response.correctness;

      },

      setMode: function(newMode) {
      },

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
          if (newValue !== oldValue) {
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
        '  <div class="cs-text-entry__text-input-holder" ng-class="response.correctness" feedback-popover="response">',
        '    <input type="text" ng-model="answer" ng-readonly="!editable" ng-class="response.correctness"',
        '           class="input-sm form-control" ',
        '           ',
        '           size="{{question.answerBlankSize}}"',
        '           style="text-align: {{question.answerAlignment}}"/>',
        '    <i ng-show="feedback" class="fa result-icon" ng-class="response.correctness" style="display: inline;"></i>',
        '  </div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
