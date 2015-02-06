var main = [
  '$log', 'ServerLogic', 'MathJaxService',
  function($log, ServerLogic, MathJaxService) {

    var designPanel = [
      '   <div class="cs-function-entry-cfg">',
      '     <div class="input-holder">',
      '       <div class="body">',
      '         <div class="description">',
      '           <p>In Evaluate an Expression, a student submits a linear or polynomial expression to be evaluated.</p>',
      '           <h5>Expression</h5>',
      "           <p>Enter the expression against which the the student's response will be evaluated. <br />",
      "           Note that <b><i> y </i></b>is the dependent variable and <b><i> f(x) </i></b> is some function ",
      "           where <b><i> x </i></b> is the independent variable. <br />",
      "           Expressions <b> must </b> be input using <b><i> x </i></b> and/or <b><i> y </i></b> variables.</p>",
      '         </div>',
      '         <div class="equation-input-row">',
      '           <span class="">y = </span>',
      '           <span>',
      '           <input type="text" class="form-control equation-input" ng-model="fullModel.correctResponse.equation" placeholder="Enter the expression here."',
      '                 />',
      '           </span>',
      '         </div>',
      '         <p>When the student submits an answer the answer will be evaluated against the expression by generating test points. ',
      '         The test points are created by replacing the <i>x</i> value within the function with random whole numbers within the ',
      '         domain. The <i>y</i> value is then determined by evaluating the equation using the javascript eval function.',
      '         This is done many times (~50) in order to be sure of the correctness.</p>',
      '         <div class="formatting-help" ng-class="{popoverOpen: fullModel.model.config.showFormattingHelp}">',
      '           <checkbox id="showHelp" ng-model="fullModel.model.config.showFormattingHelp">Show the student the formatting hints for constructing an answer</checkbox>',
      '           <div help-popover="" help-popover-visible="fullModel.model.config.showFormattingHelp"></div>',
      '         </div>',

      '         <div feedback-panel>',
      '           <div feedback-selector',
      '                fb-sel-label="If correct, show"',
      '                fb-sel-class="correct"',
      '                fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '                fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '                fb-sel-default-feedback="{{defaultCorrectFeedback}}"',
      '             ></div>',
      '           <div feedback-selector',
      '                fb-sel-label="If incorrect, show"',
      '                fb-sel-class="incorrect"',
      '                fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '                fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '                fb-sel-default-feedback="{{defaultIncorrectFeedback}}"',
      '             ></div>',
      '         </div>',
      '       </div>',
      '     </div>',
      '  </div>'
    ].join("\n");


    var panels = [
      '<div>',
      designPanel,
      '</div>'
    ].join("\n");

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      template: panels,
      link: function(scope, element, attrs) {

        var server = ServerLogic.load('corespring-function-entry');
        scope.defaultCorrectFeedback = server.keys.DEFAULT_CORRECT_FEEDBACK;
        scope.defaultIncorrectFeedback = server.keys.DEFAULT_INCORRECT_FEEDBACK;

        scope.containerBridge = {
          setModel: function(fullModel) {
            fullModel.model = fullModel.model || {};
            scope.fullModel = fullModel;
          },

          getModel: function() {
            return scope.fullModel;
          }
        };

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      }
    };
  }
];

var helpPopover = [
  '$log', 'MathJaxService',
  function($log, MathJaxService) {
    return {
      scope: {
        helpPopoverVisible: "="
      },
      restrict: 'A',
      link: function(scope, element, attrs) {

        var equationGuide = [
          '<ul>',
          '    <li>For \\(2 \\cdot 2\\), enter \\( 2*2 \\)</li>',
          '    <li>For \\( 3y \\), enter \\( 3y \\) or \\( 3*y \\)</li>',
          '    <li>For \\( \\frac{1}{x} \\), enter \\( 1 / x \\)</li>',
          '    <li>For \\( \\frac{1}{xy} \\), enter \\( 1 / (x*y) \\)</li>',
          '    <li>For \\( \\frac{2}{x+3} \\), enter \\( 2 / (x+3) \\)</li>',
          '    <li>For \\( x^{y} \\), enter \\( x \\) ^ \\( y \\)</li>',
          '    <li>For \\( x^{2} \\), enter \\( x \\) ^ \\( 2 \\)</li>',
          '    <li>For \\( 1 \\frac{x}{y} \\), enter \\(1 \\) \\( x/y \\)</li>',        
          '    <li>For \\( \\sqrt{x} \\), enter \\sqrt(x)</li>',
          '</ul>'
        ].join('');

        scope.popover = $(element)
          .popover({title: "Hints", content: function() {
            return equationGuide;
          }, placement: "bottom", html: true}).on('shown.bs.popover', function () {
            MathJaxService.parseDomForMath(0);
          });


        scope.$watch('helpPopoverVisible', function(n, prev) {
          if (!_.isUndefined(n)) {
            setTimeout(function() {
              scope.popover.popover(n ? 'show' : 'hide');
            }, n ? 100 : 0);
          }
        });
      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: "helpPopover",
    directive: helpPopover

  }
];
