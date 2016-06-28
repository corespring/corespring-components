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


      scope.showInputWarning = function() {
        $(element).popover({
          template: [
            '<div class="popover feedback-popover popover-input-warning role="tooltip">',
            '  <div class="arrow"></div>',
            '  <h3 class="popover-title"></h3>',
            '  <div class="popover-content"></div>',
            '</div>'
          ].join('\n'),
          container: element,
          content: "Please enter numbers only",
          placement: function(popover, sender) {
            var playerElement = $(element).parents('.corespring-player');
            var playerTop = playerElement.offset().top;
            var elementTop = $(element).offset().top;
            return (elementTop - playerTop > 100) ? "top" : "bottom";
          },
          html: true
        }).popover('show');
        $(window).click(function() {
           scope.hideInputWarning();
        });
      };

      scope.hideInputWarning = function() {
        $(element).popover('destroy');
      };

      scope.validate = function() {
        if (scope.question.allowIntegersOnly) {
          var s = "";
          var allowedChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
          if (scope.question.allowNegative) {
            allowedChars.push('-');
          }
          if (scope.question.allowDecimal) {
            allowedChars.push('.');
          }
          if (scope.question.allowSeparator) {
            allowedChars.push(',');
          }
          var isWarning = false;
          _.each(scope.answer, function(chr) {
            if (_.contains(allowedChars, chr)) {
              s += chr;
            } else {
              isWarning = true;
            }
          });
          scope.answer = s;
          if (isWarning) {
            scope.showInputWarning();
          } else {
            scope.hideInputWarning();
          }
        }
      };

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
          scope.hideInputWarning();
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
          scope.hideInputWarning();
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
        '<div class="cs-text-entry" ng-class="{popupFeedback: feedback.message}">',
        '  <div class="cs-text-entry__text-input-holder" ',
        '     ng-class="feedback.correctness" ',
        '     feedback-popover="response">',
        '    <input type="text" ',
        '       ng-change="validate()" ',
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