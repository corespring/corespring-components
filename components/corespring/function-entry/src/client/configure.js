var main = [
  '$log', 'ServerLogic', 'MathJaxService',
  function($log, ServerLogic, MathJaxService) {

    "use strict";

    var equationGuide = [
      '<a ng-click="hideHints = !hideHints">{{hideHints ? \'Show\' : \'Hide\'}} Formatting Hints</a>',
      '<div  class="well" ng-hide="hideHints">',
      '    <li>For \\(2 \\cdot 2\\), enter \\( 2*2 \\)</li>',
      '    <li>For \\( 3y \\), enter \\( 3y \\) or \\( 3*y \\)</li>',
      '    <li>For \\( \\frac{1}{x} \\), enter \\( 1 / x \\)</li>',
      '    <li>For \\( \\frac{1}{xy} \\), enter \\( 1 / (x*y) \\)</li>',
      '    <li>For \\( \\frac{2}{x+3} \\), enter \\( 2 / (x+3) \\)</li>',
      '    <li>For \\( x^{y} \\), enter \\( x \\) ^ \\( y \\)</li>',
      '</div>'
    ].join('');

    var helpTooltip = [
      'The Correct Answer given below will be used to generate the test points. ',
      'The test points are created by replacing the <i>x</i> value within the function',
      'with random whole numbers within the domain. ',
      'The <i>y</i> value is then determined by evaluating the equation using the javascript eval function. ',
      'This is done many times (~50) in order to be sure of the correctness.The test points then replace the ',
      'dependent and independent variables (<i>x</i> and <i>y</i>) in the response.'
    ].join('');

    var designPanel = [
      ' <div navigator-panel="Design">',
      '   <div class="cs-function-entry-cfg">',
      '     <div class="input-holder">',
      '       <div class="body">',
      '         <div class="description">This interaction requires a student to evaluate a linear or polynomial equation. The equation entered below is evaluated as an equation of the form y=f(x) where y is the dependent variable and f(x) is some function where x is the independent variable.</div>',
      '         <div class="flex-container">',
      '           <div class="flex-item">',
      '             <div class="section-header">Correct Answer',
      '               <a class="help-questionmark"',
      '                  tooltip-html-unsafe="'+helpTooltip+'"',
      '                  tooltip-placement="right"><i class="fa fa-question-circle"></i></a>',
      '             </div>',
      '             <div class="">',
      '               <span class="">y = </span>',
      '               <span>',
      '               <input type="text" class="form-control equation-input" ng-model="fullModel.correctResponse.equation" placeholder="Enter the equation here."/>',
      '               </span>',
      '             </div>',
      '             <div class="clearfix"></div>',
      '           </div>',
      '           <div class="flex-item">',
      equationGuide,
      '           </div>',
      '         </div>',

      '         <div class="cs-function-entry-cfg__answers-holder">',
      '           <checkbox id="showHelp" ng-model="fullModel.model.config.showFormattingHelp">Show student formatting help</checkbox>',
      '         </div>',

      '         <div ng-click="feedbackOn = !feedbackOn" style="margin-top: 10px"><i',
      '           class="fa fa-{{feedbackOn ? \'minus\' : \'plus\'}}-square-o"></i><span',
      '           style="margin-left: 3px">Feedback</span>',
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
      '        <div summary-feedback-input ng-model="fullModel.comments"></div>',
      '       </div>',
      '     </div>',
      '  </div>',
      '</div>'
    ].join("\n");


    var panels = [
      '<div>',
        designPanel,
      '</div>'
    ].join("\n");

    function createResponsesModel() {
      return {
        values: [],
        ignoreCase: false,
        ignoreWhitespace: false,
        feedback: {
          type: "default",
          custom: ""
        }
      };
    }

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
        MathJaxService.parseDomForMath();
      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [{
  directive: main
}];
