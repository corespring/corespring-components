var calculatorBasic = [

	function() {
    var link = function(scope, elm, attrs, container) {      

    }

    function template() {
	    return [
	      '<div class=\"calculator basic\">',
	      '  <div class="results">',
	      '    <input id="results" />',
	      '  </div>',
	      '  <div class="buttons-panel">',
	      '    <div class="left">',
	      '    <div class="clear-pad">',
	      '      <button id="backspace-button" class="backspace-button">Backspace</button>',
	      '      <button id="clear-button" class="clear-button">C</button>',	     
	      '    </div>',
	      '    <div class="numbers-pad">',
	      '      <button id="one-button" class="number-button">1</button>',
	      '      <button id="two-button" class="number-button">2</button>',
	      '      <button id="three-button" class="number-button">3</button>',
	      '      <button id="four-button" class="number-button">4</button>',
	      '      <button id="five-button" class="number-button">5</button>',
	      '      <button id="six-button" class="number-button">6</button>',
	      '      <button id="seven-button" class="number-button">7</button>',
	      '      <button id="eight-button" class="number-button">8</button>',
	      '      <button id="nine-button" class="number-button">9</button>',
	      '      <button id="zero-button" class="number-button">0</button>',
	      '      <button id="dot-button" class="number-button">.</button>',
	      '      <button id="equal-button" class="number-button">=</button>',
	      '    </div>',
	      '    </div>',
	      '    <div class="basic-functions-pad clearfix">',
	      '      <button id="sqrt-button" class="number-button" title="Square root">&radic;</button>',
	      '      <button id="plus-button" class="number-button" title="Plus">+</button>',
	      '      <button id="minus-button" class="number-button" title="Minus">-</button>',
	      '      <button id="multiply-button" class="number-button" title="Multiply">*</button>',
	      '      <button id="divide-button" class="number-button" title="Divide">/</button>',
	      '    </div>',
	      '  </div>',
	      '</div>'
	    ].join('');
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
  name: "calculatorBasic",
  directive: calculatorBasic
};
