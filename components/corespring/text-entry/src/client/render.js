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
        if (!response) return;
        scope.feedback = response.feedback;
        scope.correctClass = response.feedback.correctness;
        if (!_.isEmpty(response.feedback.message)) {
          inputElement.popover({
            placement: 'auto',
            html: true,
            content: response.feedback.message,
            title: {"correct": "Correct", "incorrect": "Incorrect", "partial": "Partial"}[response.feedback.correctness],
            viewport: { selector: '.corespring-player', padding: 0 }
          }).popover('show');
        }
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
        '<form class="cs-text-entry form-inline">',
        '  <div class="cs-text-entry__text-input-holder form-group has-feedback" ng-class="feedback.correctness">',
        '    <input type="text" ng-model="answer" ng-readonly="!editable" ng-class="feedback.correctness"',
        '           class="input-sm form-control" ',
        '           size="{{question.answerBlankSize}}"',
        '           style="text-align: {{question.answerAlignment}}"/>',
        '    <i ng-show="feedback" class="fa result-icon" ng-class="feedback.correctness" style="display: inline;"></i>',
        '  </div>',
        '</form>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
