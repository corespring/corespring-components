var link, main;


main = [
  '$timeout',
  'MathJaxService',
  function($timeout, MathJaxService) {
    link = function() {
      return function(scope, element, attrs) {

        var rawHintHtml, clickBound;

        function shouldShowFormattingHelp() {
          var defaultValue = true;
          if (scope.correctClass) {
            return false;
          }
          if (scope.question && scope.question.config && scope.question.config.hasOwnProperty('showFormattingHelp')) {
            return scope.question.config.showFormattingHelp;
          } else {
            return defaultValue;
          }
        }

        function resetHintPopover() {
          $(element).find('.text-input').popover('destroy');
          clickBound = false;
          if (shouldShowFormattingHelp()) {
            $(element).find('.text-input').popover({
              content: rawHintHtml,
              title: 'Hints',
              html: true,
              placement: 'bottom'
            }).on('shown.bs.popover', function () {
              if (!clickBound) {
                $(element).find('.popover').click(function() {
                  $(element).find('.text-input').popover('hide');
                });
                clickBound = true;
              }
            });
          }
        }

        scope.helpOn = false;
        scope.editable = true;

        scope.containerBridge = {
          setDataAndSession: function(dataAndSession) {
            scope.question = dataAndSession.data.model;
            scope.session = dataAndSession.session || {};

            scope.answer = scope.session.answers;
            resetHintPopover();
          },

          getSession: function() {
            var answer = scope.answer;

            return {
              answers: answer
            };
          },

          // sets the server's response
          setResponse: function(response) {
            console.log("Setting Response for function entry:");
            console.log(response);

            scope.correctClass = response.correctness;
            if (_.isEmpty(scope.answer)) {
              scope.correctClass = 'warning';
            }
            scope.feedback = response.feedback;
            scope.comments = response.comments;

            $(element).find('.text-input').popover('destroy');

            var title, popoverClass;
            var content = response.feedback;

            if (response.correctness === 'incorrect') {
              if (_.isEmpty(scope.answer)) {
                title = 'Oops. Try again.';
                content = "There seems to be an error in your submission";
                popoverClass = 'warning';
              } else {
                title = 'Incorrect.';
                popoverClass = 'incorrect';
              }
            } else if (response.correctness === 'correct') {
              title = 'Correct.';
              popoverClass = 'correct';
            }

            $(element).find('.text-input').popover({
                title: title,
                template: '<div class="popover popover-' + popoverClass + '" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                content: content,
                placement: 'bottom',
                html: true}
            ).popover('show');

            $(element).find('.popover').click(function() {
              $(element).find('.text-input').popover('hide');
            });

          },

          setMode: function(newMode) {
          },

          reset: function() {
            scope.answer = undefined;
            scope.correctClass = undefined;
            scope.feedback = undefined;
            scope.comments = undefined;
            resetHintPopover();
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

        MathJaxService.onEndProcess(function() {
          if (!rawHintHtml) {
            rawHintHtml = $(element).find('.hidden-math').html();
            resetHintPopover();
          }
        });

        scope.$emit('registerComponent', attrs.id, scope.containerBridge);
      };
    };

    var def;
    def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [
        '<div class="view-function-entry">',
        '  <span class="text-input {{correctClass}}">',
        '    <input type="text" ng-disabled="!editable" ng-model="answer" class="form-control" />',
        '  </span>',
        '  <div ng-show="comments" class="well" ng-bind-html-unsafe="comments"></div>',
        '  <div class="hidden-math">',
        '    <ul style=\'text-align: left; padding-left: 10px\'>',
        '       <li>For \\(2 \\cdot 2\\), enter \\( 2*2 \\)</li>',
        '       <li>For \\( 3y \\), enter \\( 3y \\) or \\( 3*y \\)</li>',
        '       <li>For \\( \\frac{1}{x} \\), enter \\( 1 / x \\)</li>',
        '       <li>For \\( \\frac{1}{xy} \\), enter \\( 1 / (x*y) \\)</li>',
        '       <li>For \\( \\frac{2}{x+3} \\), enter \\( 2 / (x+3) \\)</li>',
        '       <li>For \\( x^{y} \\), enter \\( x \\) ^ \\( y \\)</li>',
        '    </ul>',
        '  </div>',
        '</div>'].join("\n")
    };

    return def;
  }
]
;

exports.framework = 'angular';
exports.directive = main;
