var calculatorBasicTemplate = [
	'CalculatorBasic',
	function(CalculatorBasic) {
    
    var calculatorBasic;
    
    var link = function(scope, elm, attrs, container) {      	    	

    	var inputResults = elm.find('.input-results');
			calculatorBasic = new CalculatorBasic(scope, inputResults);
			calculatorBasic.extendScope(scope, 'calculator-basic-template');

			function click(button, type, logic){
				calculatorBasic.click(button, type, logic);
			}

			scope.click = click;
    };    

    function template() {
	    return [
	      '<div class=\"calculator basic\">',
	      '  <div class="results">',
	      '    <input id="results" class="input-results" ng-bind="calculatorBasic.results()" />',
	      '  </div>',
	      '  <div class="buttons-panel">',
	      '    <div class="left">',
	      '      <div class="clear-pad">',
	      '        <button ng-repeat="button in regions[\'clear\'].buttons" id="{{button}}-button" class="{{buttons[button].cssClass}}-button" title="{{buttons[button].name}}" ng-click="click(button, buttons[button].type, buttons[button].logic, this)">{{buttons[button].symbol}}</button>',
	      '      </div>',
	      '      <div class="numbers-pad">',
	      '        <button ng-repeat="button in regions[\'numbers\'].buttons" id="{{button}}-button" class="{{buttons[button].cssClass}}-button" title="{{buttons[button].name}}" ng-click="click(button, buttons[button].type, buttons[button].logic, this)">{{buttons[button].symbol}}</button>',
	      '      </div>',
	      '    </div>',
	      '    <div class="basic-functions-pad clearfix">',
	      '      <button ng-repeat="button in regions[\'basic\'].buttons" id="{{button}}-button" class="{{buttons[button].cssClass}}-button" title="{{buttons[button].name}}" ng-click="click(button, buttons[button].type, buttons[button].logic, this)">{{buttons[button].symbol}}</button>',
	      '    </div>',
	      '  </div>',
	      '</div>'
	    ].join('\n');
		}
    
    return {
      restrict: 'EA',
      replace: true,
      link: link,
      scope: {
      },
      template: template()
    };
	}
];

exports.framework = 'angular';
exports.directive = {
  name: "calculatorBasicTemplate",
  directive: calculatorBasicTemplate
};
