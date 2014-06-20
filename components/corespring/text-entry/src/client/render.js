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
        scope.feedback = response.feedback;
        scope.correctClass = response.feedback.correctness;
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
        '           class="cs-text-entry__text-input form-control text-input" ',
        '           size="{{question.answerBlankSize}}"',
        '           style="text-align: {{question.answerAlignment}}"/>',
        '  </div>',
        '  <div ng-show="feedback" class="feedback">&nbsp;',
        '    <div class="tooltip">',
        '      <div class="tooltip-inner" ng-bind-html-unsafe="feedback.message"></div>',
        '      <span class="caret"></span>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
