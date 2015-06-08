var calculatorConfig = [
  function() {

    var buttons = [];
    // Clear section
    buttons['clear'] = { name: 'Clear', symbol: 'C', logic: 'core', type: 'Misc', cssClass: 'clear' };
    buttons['backspace'] = { name: 'Backspace', symbol: 'Backspace', logic: 'core', type: 'Misc', cssClass: 'backspace' };
    // Numbers
    buttons['one'] = { name: 'One', symbol: '1', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['two'] = { name: 'Two', symbol: '2', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['three'] = { name: 'Three', symbol: '3', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['four'] = { name: 'Four', symbol: '4', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['five'] = { name: 'Five', symbol: '5', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['six'] = { name: 'Six', symbol: '6', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['seven'] = { name: 'Seven', symbol: '7', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['eight'] = { name: 'Eight', symbol: '8', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['nine'] = { name: 'Nine', symbol: '9', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['zero'] = { name: 'Zero', symbol: '0', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['dot'] = { name: 'Dot', symbol: '.', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons['equal'] = { name: 'Equal', symbol: '=', logic: 'core', type: 'unary_Operator', cssClass: 'number' };
    // Basic functions
    buttons['sqrt'] = { name: 'Square root', symbol: '√', logic: 'basic', type: 'unary_Operator', cssClass: 'basic-function' };
    buttons['plus'] = { name: 'Plus', symbol: '+', logic: 'basic', type: 'binary_Operator', cssClass: 'basic-function' };
    buttons['minus'] = { name: 'Minus', symbol: '-', logic: 'basic', type: 'binary_Operator', cssClass: 'basic-function' };
    buttons['multiply'] = { name: 'Multiply', symbol: '*', logic: 'basic', type: 'binary_Operator', cssClass: 'basic-function' };
    buttons['divide'] = { name: 'Divide', symbol: ' /', logic: 'basic', type: 'binary_Operator', cssClass: 'basic-function' };

    var regions = [];
    regions['clear'] = { 
      name: 'Clear area',
      buttons: ['backspace', 'clear']
    };
    regions['numbers'] = { 
      name: 'Numbers area',
      buttons: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'zero', 'dot', 'equal']
    };
    regions['basic'] = { 
      name: 'Basic functions area', 
      buttons: ['sqrt', 'plus', 'minus', 'multiply', 'divide']
    };

    var type = [];
    type['basic'] = { 
      name: 'Basic',
      regions: ['clear', 'numbers', 'basic']
    };
    type['scientific'] = { name: 'Scientific' };
    type['graphing'] = { name: 'Graphing/Regression' };
    
    function CalculatorConfig() {

      this.postLink = function(scope) {
        scope.type = type;
        scope.regions = regions;
        scope.buttons = buttons;
      }      
    }

    return CalculatorConfig;
  }
];

exports.framework = "angular";
exports.factory = calculatorConfig;