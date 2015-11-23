var main = [

  function() {
    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {

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
          scope.session = dataAndSession.session || {
            answers: ""
          };
          scope.answer = scope.session.answers;
        },

        getSession: function() {
          return {
            answers: scope.answer
          };
        },

        setInstructorData: function(data) {
          scope.answer = data.correctResponses.values[0];

          var hasMoreCorrectResponses = data.correctResponses.values.length > 1;
          var hasPartialResponses = data.partialResponses && data.partialResponses.values.length > 0;

          function wrapAnswer(c){
            return " <div class='cs-text-entry__response'>" + c + "</div> ";
          }

          var message = (hasMoreCorrectResponses || hasPartialResponses) ? [
            (hasMoreCorrectResponses) ? "Additional correct answers:<br/>" + _.map(_.drop(data.correctResponses.values), wrapAnswer).join('') + "<br/><br/>" : "",
            (hasPartialResponses) ? "Partially correct answers:<br/>" + _.map(data.partialResponses.values, wrapAnswer).join('') : ""
          ].join("") : undefined;
          this.setResponse({feedback: {correctness: 'correct', message: message}});
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
    }

    function template() {
      return [
        '<div class="cs-text-entry" ng-class="{popupFeedback: feedback}">',
        '  <div class="cs-text-entry__text-input-holder" ',
        '     ng-class="feedback.correctness" ',
        '     feedback-popover="response">',
        '    <input type="text" ',
        '       ng-model="answer" ',
        '       ng-readonly="!editable" ',
        '       ng-class="feedback.correctness"',
        '       class="input-sm form-control" ',
        '       size="{{question.answerBlankSize}}"',
        '       style="text-align: {{question.answerAlignment}}"/>',
        '    <i ng-show="feedback" ',
        '       class="fa result-icon" ',
        '       ng-class="feedback.correctness" ',
        '       style="display: inline;"',
        '      ></i>',
        '  </div>',
        '</div>'
      ].join("\n");
    }
  }];

exports.framework = 'angular';
exports.directive = main;