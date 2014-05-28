var link, main;


main = [
  'MathJaxService',
  function(MathJaxService) {
    link = function() {
      return function(scope, element, attrs) {

        scope.tooltipText = function() {
          if (scope.question && scope.question.config.showFormattingHelp) {
            return [
              '<ul style=\'text-align: left\'>',
              '   <li>For \\(2 \\cdot 2\\), enter \\( 2*2 \\)</li>',
              '   <li>For \\( 3y \\), enter \\( 3y \\) or \\( 3*y \\)</li>',
              '   <li>For \\( \\frac{1}{x} \\), enter \\( 1 / x \\)</li>',
              '   <li>For \\( \\frac{1}{xy} \\), enter \\( 1 / (x*y) \\)</li>',
              '   <li>For \\( \\frac{2}{x+3} \\), enter \\( 2 / (x+3) \\)</li>',
              '   <li>For \\( x^{y} \\), enter \\( x \\) ^ \\( y \\)</li>',
              '</ul>'
            ].join('');
          } else {
            return '';
          }
        };


        scope.showTooltip = function(ev) {
          setTimeout(function() {
            MathJaxService.parseDomForMath();
          }, 10);
        };

        scope.helpOn = false;
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
              answers: answer
            };
          },

          // sets the server's response
          setResponse: function(response) {
            console.log("Setting Response for function entry:");
            console.log(response);

            scope.correctClass = response.correctness;
            scope.feedback = response.feedback;
            scope.comments = response.comments;
          },

          setMode: function(newMode) {
          },

          reset: function() {
            scope.answer = undefined;
            scope.correctClass = undefined;
            scope.feedback = undefined;
            scope.comments = undefined;
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

    var def;
    def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [
        '<div class="view-function-entry">',
        '  <span class="text-input">',
        '    <input type="text" ng-model="answer" class="form-control {{correctClass}}" ng-mouseover="showTooltip($event)" tooltip-html-unsafe="{{tooltipText()}}" tooltip-placement="bottom" />',
        '  </span>',
        '  <div ng-show="feedback" class="feedback {{correctClass}}" ng-bind-html-unsafe="feedback"></div>',
        '  <div ng-show="comments" class="well" ng-bind-html-unsafe="comments"></div>',
        '</div>'].join("\n")
    };

    return def;
  }
]
;

exports.framework = 'angular';
exports.directive = main;
