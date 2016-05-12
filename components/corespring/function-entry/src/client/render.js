var main = [
  '$timeout',
  'MathJaxService',
  function($timeout, MathJaxService) {

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: template()
    };

    function link(scope, element, attrs) {

      var rawHintHtml, clickBound;

      scope.popupVisible = false;

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
            content: function() {
              return $(element).find('.hidden-math').html();
            },
            title: 'Hints',
            html: true,
            placement: 'bottom'
          }).on('shown.bs.popover', function() {
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
          return {
            answers: scope.answer
          };
        },

        setInstructorData: function(data) {
          scope.answer = data.correctResponse.equation;
          this.setResponse({correctness: 'correct'});
        },

        // sets the server's response
        setResponse: function(response) {
          $(element).find('.text-input').popover('destroy');

          scope.correctClass = response.correctness;
          if (_.isEmpty(scope.answer)) {
            scope.correctClass = 'warning';
            response.correctness = 'warning';
          }
          scope.response = response;
        },

        setMode: function(newMode) {},

        reset: function() {
          scope.answer = undefined;
          scope.correctClass = undefined;
          scope.response = undefined;
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

      scope.hasFeedback = function() {
        return scope.instructorResponse || scope.response;
      };

      scope.$watch('answer', function() {
        scope.inputClass = (scope.answer && scope.answer.trim().length > 0) ? 'filled-in' : '';
      });

      scope.$watch('response', function() {
        var correctnessMap = {
          'warning' : 'nothing-submitted',
          'partial' : 'partially-correct'
        };
        console.log('scope.response', scope.response);
        scope.iconKey = scope.response ?
          (_.has(correctnessMap, scope.response.correctness) ? correctnessMap[scope.response.correctness] : scope.response.correctness) : '';
      });

      MathJaxService.parseDomForMath(0, element[0]);

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    }

    function template() {
      return [
        '<div class="view-function-entry" ng-class="{\'with-feedback\': hasFeedback()}">',
        '  <div feedback-popover="response">',
        '    <span class="text-input">',
        '      <input type="text" ng-disabled="!editable" ng-model="answer" class="form-control {{inputClass}} {{correctClass}}" />',
        '    </span>',
        '      <span class="feedback-icon" feedback-popover="response" ng-if="!isInstructorResponse()">',
        '        <svg-icon open="{{popupVisible}}" category="{{feedback && feedback.message ? \'feedback\' : \'\'}}"',
        '            key="{{iconKey}}" shape="square" icon-set="emoji" />',
        '      </span>',
        '  </div>',
        '  <div ng-show="response.comments" class="well" ng-bind-html-unsafe="response.comments"></div>',
        '  <div class="hidden-math">',
        '    <ul style=\'text-align: left; padding-left: 10px\'>',
        '       <li>For \\(2 \\cdot 2\\), enter \\( 2*2 \\)</li>',
        '       <li>For \\( 3y \\), enter \\( 3y \\) or \\( 3*y \\)</li>',
        '       <li>For \\( \\frac{1}{x} \\), enter \\( 1 / x \\)</li>',
        '       <li>For \\( \\frac{1}{xy} \\), enter \\( 1 / (x*y) \\)</li>',
        '       <li>For \\( \\frac{2}{x+3} \\), enter \\( 2 / (x+3) \\)</li>',
        '       <li>For \\( x^{y} \\), enter \\( x \\) ^ \\( y \\)</li>',
        '       <li>For \\( x^{2} \\), enter \\(( x \\) ^ \\( 2 )\\)</li>',
        '       <li>For \\( 1 \\frac{x}{y} \\), enter \\(1 \\) \\( x/y \\)</li>',
        '       <li>For \\( \\sqrt{x} \\), enter \\sqrt(x)</li>',
        '    </ul>',
        '  </div>',
        '</div>'].join("\n");
    }
  }
];

exports.framework = 'angular';
exports.directive = main;