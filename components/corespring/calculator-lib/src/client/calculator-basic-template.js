var calculatorBasicTemplate = [
	'Calculator',
	function(Calculator) {
    
    var calculator;
    
    var link = function(scope, elm, attrs, container) {      	    	

    	var inputResults = elm.find('.input-results');
			calculator = new Calculator(scope, inputResults);
			calculator.extendScope(scope, 'calculator-basic-template');

			function click(button, type, logic){
				calculator.click(button, type, logic);
			}

			scope.click = click;
    };    

    function template() {
	    return [
	      '<div class=\"calculator basic\">',
				'  <div class="results">',
				'    <input id="results" class="input-results" ng-readonly="true" />',
				'  </div>',
	      '  <div class="buttons-panel">',
	      '    <div class="left">',
	      '      <div class="clear-pad">',
	      '        <button ng-repeat="button in regions[\'clear\'].buttons" ',
        '           id="{{button}}-button"',
        '           class="{{buttons[button].cssClass}}-button"',
        '           title="{{buttons[button].name}}"',
        '           ng-click="click(buttons[button], this)"><div ng-bind-html-unsafe="buttons[button].symbol"></div></button>',
	      '      </div>',
	      '      <div class="numbers-pad">',
	      '        <button ng-repeat="button in regions[\'numbers\'].buttons" ',
        '           id="{{button}}-button"',
        '           class="{{buttons[button].cssClass}}-button"',
        '           title="{{buttons[button].name}}"',
        '           ng-click="click(buttons[button], this)"><div ng-bind-html-unsafe="buttons[button].symbol"></div></button>',
	      '      </div>',
	      '    </div>',
	      '    <div class="basic-functions-pad clearfix">',
	      '      <button ng-repeat="button in regions[\'basic\'].buttons" ',
        '         id="{{button}}-button"',
        '         class="{{buttons[button].cssClass}}-button"',
        '         title="{{buttons[button].name}}"',
        '         ng-click="click(buttons[button], this)"><div ng-bind-html-unsafe="buttons[button].symbol"></div></button>',
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
