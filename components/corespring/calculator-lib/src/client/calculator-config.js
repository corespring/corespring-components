var calculatorConfig = [
  function() {

    var buttons = [];
    // Clear section
    buttons.clear = { id: 'clear', name: 'Clear', symbol: 'clr', logic: 'core', type: 'Misc', cssClass: 'clear' };
    buttons.backspace = { id: 'backspace', name: 'Backspace', symbol: 'bksp', logic: 'core', type: 'Misc', cssClass: 'backspace' };
    // Numbers
    buttons.one = { id: 'one', name: 'One', symbol: '1', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.two = { id: 'two', name: 'Two', symbol: '2', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.three = { id: 'three', name: 'Three', symbol: '3', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.four = { id: 'four', name: 'Four', symbol: '4', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.five = { id: 'five', name: 'Five', symbol: '5', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.six = { id: 'six', name: 'Six', symbol: '6', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.seven = { id: 'seven', name: 'Seven', symbol: '7', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.eight = { id: 'eight', name: 'Eight', symbol: '8', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.nine = { id: 'nine', name: 'Nine', symbol: '9', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.zero = { id: 'zero', name: 'Zero', symbol: '0', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.dot = { id: 'dot', name: 'Dot', symbol: '.', logic: 'core', type: 'Number', cssClass: 'number' };
    buttons.equals = { id: 'equals', name: 'Equals', symbol: '=', logic: 'core', type: 'Operator', numOfOperands: '1', cssClass: 'number' };
    // Basic functions
    buttons.sqrt = { id: 'sqrt', name: 'Square root', symbol: '√', logic: 'basic', type: 'Operator', numOfOperands: '1', cssClass: 'basic-function' };
    buttons.plus = { id: 'plus', name: 'Plus', symbol: '+', logic: 'basic', type: 'Operator', numOfOperands: '2', cssClass: 'basic-function' };
    buttons.minus = { id: 'minus', name: 'Minus', symbol: '-', logic: 'basic', type: 'Operator', numOfOperands: '2', cssClass: 'basic-function' };
    buttons.multiply = { id: 'multiply', name: 'Multiply', symbol: 'x', logic: 'basic', type: 'Operator', numOfOperands: '2', cssClass: 'basic-function' };
    buttons.divide = { id: 'divide', name: 'Divide', symbol: ' /', logic: 'basic', type: 'Operator', numOfOperands: '2', cssClass: 'basic-function' };
    buttons.change_sign = { id: 'change_sign', name: 'Divide', symbol: '+/-', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'basic-function' };
    buttons.pi = { id: 'pi', name: 'Pi', symbol: 'π', logic: 'scientific', type: 'Constant', cssClass: 'basic-function' };
    buttons.abs = { id: 'abs', name: 'Absolute value', symbol: 'ABS', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'basic-function' };

    // Memory section
    buttons.store = { id: 'store', name: 'Store', symbol: 'STO', logic: 'core', type: 'Misc', cssClass: 'store' };
    buttons.recall = { id: 'recall', name: 'Recall', symbol: 'RCL', logic: 'core', type: 'Misc', cssClass: 'recall' };

    // Deg Rad section
    buttons.degrees = { id: 'degrees', name: 'Degrees', symbol: 'DEG', logic: 'scientific', type: 'Misc', cssClass: 'deg-rad' };
    buttons.radians = { id: 'radians', name: 'Radians', symbol: 'RAD', logic: 'scientific', type: 'Misc', cssClass: 'deg-rad' };

    // Advanced function buttons
    buttons.left_parenthesis = { id: 'left_parenthesis', name: 'Left parenthesis', symbol: '(', logic: 'core', type: 'Misc', cssClass: 'advanced' };
    buttons.right_parenthesis = { id: 'right_parenthesis', name: 'Right parenthesis', symbol: ')', logic: 'core', type: 'Misc', cssClass: 'advanced' };
    buttons.sin = { id: 'sin', name: 'Sin', symbol: 'Sin', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.arcsin = { id: 'asin', name: 'Arcsin', symbol: 'Sin<sup>-1</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.cos = { id: 'cos', name: 'Cos', symbol: 'Cos', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.arccos = { id: 'acos', name: 'Arccos', symbol: 'Cos<sup>-1</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.tan = { id: 'tan', name: 'Tan', symbol: 'Tan', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.arctan = { id: 'atan', name: 'Arctan', symbol: 'Tan<sup>-1</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.ex = { id: 'ex', name: 'e^x', symbol: 'e<sup>x</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.ln = { id: 'ln', name: 'ln', symbol: 'ln', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.log = { id: 'log', name: 'log', symbol: 'log', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.factorial = { id: 'factorial', name: 'Factorial', symbol: 'n!', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.onex = { id: 'onex', name: '1/x', symbol: '<sup>1</sup>/<sub>x</sub>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.power = { id: 'power', name: 'x^y', symbol: 'x<sup>y</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '2', cssClass: 'advanced' };
    buttons.power_two = { id: 'power_two', name: 'x^2', symbol: 'x<sup>2</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };
    buttons.power_three = { id: 'power_three', name: 'x^3', symbol: 'x<sup>3</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced' };

    var regions = [];
    regions.clear = { 
      name: 'Clear area',
      buttons: ['backspace', 'clear']
    };
    regions.numbers = { 
      name: 'Numbers area',
      buttons: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'zero', 'dot', 'equals']
    };
    regions.basic = { 
      name: 'Basic functions area', 
      buttons: ['sqrt', 'plus', 'minus', 'multiply', 'divide']
    };    
    regions.memory = { 
      name: 'Memory area',
      buttons: ['store', 'recall']
    };
    regions.scientific_basic = { 
      name: 'Scientific basic functions area',
      buttons: ['plus', 'minus', 'multiply', 'divide', 'sqrt', 'change_sign', 'pi', 'abs']
    };
    regions.deg_rad = { 
      name: 'Degrees/radians area',
      buttons: ['degrees', 'radians']
    };

    regions.scientific_advanced = { 
      name: 'Scientific advanced functions area',
      buttons: ['left_parenthesis', 'right_parenthesis', 'ex', 'ln', 'sin', 'arcsin', 'log', 'factorial', 'cos', 'arccos', 'onex', 'power', 'tan', 'arctan', 'power_two', 'power_three']
    };

    var types = [];
    types.basic = { 
      name: 'Basic',
      regions: ['clear', 'numbers', 'basic']
    };
    types.scientific = { 
      name: 'Scientific',
      regions: ['clear', 'memory', 'numbers', 'scientific_basic', 'deg_rad', 'scientific_advanced']
    };
    
    function CalculatorConfig() {

      this.postLink = function(scope) {
        scope.types = types;
        scope.regions = regions;
        scope.buttons = buttons;
      };      
    }

    return CalculatorConfig;
  }
];

exports.framework = "angular";
exports.factory = calculatorConfig;