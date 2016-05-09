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

      scope.popupVisible = false;

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

      scope.inputClasses = function() {
        return [
          scope.answer && scope.answer.length > 0 ? 'filled-in' : '',
          scope.feedback ? 'submitted' : ''
        ].join(' ');
      };

      scope.$watch('response', function() {
        console.log('response', scope.response);
        scope.iconKey = scope.response ? ((scope.response.correctness === 'warning') ? 'nothing-submitted' : scope.response.correctness) : '';
      });

      element.on('show.bs.popover', function(e) {
        scope.triggerIcon(e, true);
      });

      element.on('hide.bs.popover', function(e) {
        scope.triggerIcon(e, false);
      });

      scope.triggerIcon = function(e, popoverToggled) {
        scope.popupVisible = popoverToggled;
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    }

    function template() {
      return [
        '<span class="cs-text-entry-wrapper">',
        '  <div class="cs-text-entry">',
        '    <div class="cs-text-entry__text-input-holder" ',
        '       ng-class="feedback.correctness">',
        '      <input type="text" ',
        '         ng-model="answer" ',
        '         ng-readonly="!editable" ',
        '         ng-class="feedback.correctness"',
        '         class="input-sm form-control {{inputClasses()}}" ',
        '         size="{{question.answerBlankSize}}"',
        '         style="text-align: {{question.answerAlignment}}"/>',
        '    </div>',
        '  </div>',
        '  <span class="feedback-icon" feedback-popover="response">',
        '    <svg-icon open="{{popupVisible}}" category="{{feedback && feedback.message ? \'feedback\' : \'\'}}"',
        '        key="{{iconKey}}" shape="square" icon-set="emoji" />',
        '  </span>',
        '</span>'
      ].join("\n");
    }
  }];

exports.framework = 'angular';
exports.directive = main;