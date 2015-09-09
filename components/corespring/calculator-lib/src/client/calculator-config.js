var calculatorConfig = [
  function() {

    var angularUnits = {};
    angularUnits.DEGREES = 'degrees';
    angularUnits.RADIANS = 'radians';      

    var buttons = {};
    // Clear section
    buttons.clear = { id: 'clear', name: 'Clear', symbol: 'clr', logic: 'core', type: 'Misc', cssClass: 'clear' };
    buttons.backspace = { id: 'backspace', name: 'Backspace', symbol: 'bksp', logic: 'core', type: 'Misc', cssClass: 'backspace' };
    // Numbers
    buttons.one = { id: 'one', name: 'One', symbol: '1', logic: 'core', type: 'Number', cssClass: 'number', operand: '1' };
    buttons.two = { id: 'two', name: 'Two', symbol: '2', logic: 'core', type: 'Number', cssClass: 'number', operand: '2' };
    buttons.three = { id: 'three', name: 'Three', symbol: '3', logic: 'core', type: 'Number', cssClass: 'number', operand: '3' };
    buttons.four = { id: 'four', name: 'Four', symbol: '4', logic: 'core', type: 'Number', cssClass: 'number', operand: '4' };
    buttons.five = { id: 'five', name: 'Five', symbol: '5', logic: 'core', type: 'Number', cssClass: 'number', operand: '5' };
    buttons.six = { id: 'six', name: 'Six', symbol: '6', logic: 'core', type: 'Number', cssClass: 'number', operand: '6' };
    buttons.seven = { id: 'seven', name: 'Seven', symbol: '7', logic: 'core', type: 'Number', cssClass: 'number', operand: '7' };
    buttons.eight = { id: 'eight', name: 'Eight', symbol: '8', logic: 'core', type: 'Number', cssClass: 'number', operand: '8' };
    buttons.nine = { id: 'nine', name: 'Nine', symbol: '9', logic: 'core', type: 'Number', cssClass: 'number', operand: '9' };
    buttons.zero = { id: 'zero', name: 'Zero', symbol: '0', logic: 'core', type: 'Number', cssClass: 'number', operand: '0' };
    buttons.decimal = { id: 'decimal', name: 'Decimal', symbol: '.', logic: 'core', type: 'Number', cssClass: 'number decimal', operand: '.' };
    buttons.equals = { id: 'equals', name: 'Equals', symbol: '&#61;', logic: 'core', type: 'Operator', numOfOperands: '1', cssClass: 'number equals' };
    // Basic functions
    buttons.sqrt = { id: 'sqrt', name: 'Square root', symbol: '&#8730;', logic: 'basic', type: 'Operator', numOfOperands: '1', cssClass: 'basic-function', operation: function(a) { return Math.sqrt(a); } };
    buttons.plus = { id: 'plus', name: 'Plus', symbol: '&#43;', logic: 'basic', type: 'Operator', numOfOperands: '2', cssClass: 'basic-function', operation: function(a, b) { return a + b; } };
    buttons.minus = { id: 'minus', name: 'Minus', symbol: '&#45;', logic: 'basic', type: 'Operator', numOfOperands: '2', cssClass: 'basic-function', operation: function(a, b) { return a - b; } };
    buttons.multiply = { id: 'multiply', name: 'Multiply', symbol: '&#120;', logic: 'basic', type: 'Operator', numOfOperands: '2', cssClass: 'basic-function', operation: function(a, b) { return a * b; } };
    buttons.divide = { id: 'divide', name: 'Divide', symbol: '&#247;', logic: 'basic', type: 'Operator', numOfOperands: '2', cssClass: 'basic-function', operation: function(a, b) { return a / b; } };
    buttons.change_sign = { id: 'change_sign', name: 'Plus/minus', symbol: '+/-', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'basic-function', operation: function(a) { return a * -1; } };
    buttons.pi = { id: 'pi', name: 'Pi', symbol: '&#960;', logic: 'scientific', type: 'Constant', cssClass: 'basic-function', operand: Math.PI };
    buttons.abs = { id: 'abs', name: 'Absolute value', symbol: 'abs', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'basic-function', operation: function(a) { return Math.abs(a); } };

    // Memory section
    buttons.store = { id: 'store', name: 'Store', symbol: 'sto', logic: 'core', type: 'Misc', cssClass: 'store' };
    buttons.recall = { id: 'recall', name: 'Recall', symbol: 'rcl', logic: 'core', type: 'Misc', cssClass: 'recall' };

    // Deg Rad section
    buttons.degrees = { id: angularUnits.DEGREES, name: 'Degrees', symbol: 'deg', logic: 'scientific', type: 'Misc', cssClass: 'deg' };
    buttons.radians = { id: angularUnits.RADIANS, name: 'Radians', symbol: 'rad', logic: 'scientific', type: 'Misc', cssClass: 'rad' };

    // Advanced function buttons
    buttons.left_parenthesis = { id: 'left_parenthesis', name: 'Left parenthesis', symbol: '&#40;', logic: 'core', type: 'Misc', cssClass: 'advanced' };
    buttons.right_parenthesis = { id: 'right_parenthesis', name: 'Right parenthesis', symbol: '&#41;', logic: 'core', type: 'Misc', cssClass: 'advanced' };
    buttons.sin = { id: 'sin', name: 'Sin', symbol: 'sin', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a, angularMeasure) { return Math.sin(trigonometricValue(a, angularMeasure, angularUnits.RADIANS)); } }; 
    buttons.asin = { id: 'asin', name: 'Arcsin', symbol: 'sin<sup>-1</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a, angularMeasure) { return trigonometricValue(Math.asin(a), angularUnits.RADIANS, angularMeasure); } };
    buttons.cos = { id: 'cos', name: 'Cos', symbol: 'cos', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a, angularMeasure) { return Math.cos(trigonometricValue(a, angularMeasure, angularUnits.RADIANS)); } };
    buttons.acos = { id: 'acos', name: 'Arccos', symbol: 'cos<sup>-1</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a, angularMeasure) { return trigonometricValue(Math.acos(a), angularUnits.RADIANS, angularMeasure); } };
    buttons.tan = { id: 'tan', name: 'Tan', symbol: 'tan', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a, angularMeasure) { return Math.tan(trigonometricValue(a, angularMeasure, angularUnits.RADIANS)); } };
    buttons.atan = { id: 'atan', name: 'Arctan', symbol: 'tan<sup>-1</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a, angularMeasure) { return trigonometricValue(Math.atan(a), angularUnits.RADIANS, angularMeasure); } };
    buttons.ex = { id: 'ex', name: 'e^x', symbol: 'e<sup>x</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a) { return Math.exp(a); } };
    buttons.ln = { id: 'ln', name: 'ln', symbol: 'ln', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a) { return Math.log(a); } };
    buttons.log = { id: 'log', name: 'log', symbol: 'log', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a) { return log10(a); } };
    buttons.factorial = { id: 'factorial', name: 'Factorial', symbol: 'n!', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a) { return factorial(Math.round(a)); } };
    buttons.onex = { id: 'onex', name: '1/x', symbol: '1/x', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a) { return 1 / a; } };
    buttons.power = { id: 'power', name: 'x^y', symbol: 'x<sup>y</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '2', cssClass: 'advanced', operation: function(a, b) { return Math.pow(a, b); } };
    buttons.power_two = { id: 'power_two', name: 'x^2', symbol: 'x<sup>2</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a) { return Math.pow(a, 2); } };
    buttons.power_three = { id: 'power_three', name: 'x^3', symbol: 'x<sup>3</sup>', logic: 'scientific', type: 'Operator', numOfOperands: '1', cssClass: 'advanced', operation: function(a) { return Math.pow(a, 3); } };

    var regions = {};
    regions.clear = { 
      name: 'Clear area',
      buttons: ['backspace', 'clear'],
      cssClass: 'clear'
    };
    regions.numbers = { 
      name: 'Numbers area',
      buttons: ['seven', 'eight', 'nine', 'four', 'five', 'six', 'one', 'two', 'three', 'zero', 'decimal', 'equals'],
      cssClass: 'numbers'
    };
    regions.basic = { 
      name: 'Basic functions area', 
      buttons: ['sqrt', 'plus', 'minus', 'multiply', 'divide'],
      cssClass: 'basic'
    };    
    regions.memory = { 
      name: 'Memory area',
      buttons: ['store', 'recall'],
      cssClass: 'memory'
    };
    regions.scientific_basic = { 
      name: 'Scientific basic functions area',
      buttons: ['plus', 'minus', 'multiply', 'divide', 'sqrt', 'change_sign', 'pi', 'abs'],
      cssClass: 'scientific-basic'
    };
    regions.angular_measure = { 
      name: 'Degrees/radians area',
      buttons: ['degrees', 'radians'],
      cssClass: 'angular-measure'
    };

    regions.scientific_advanced = { 
      name: 'Scientific advanced functions area',
      buttons: ['left_parenthesis', 'right_parenthesis', 'ex', 'ln', 'sin', 'asin', 'log', 'factorial', 'cos', 'acos', 'onex', 'power', 'tan', 'atan', 'power_two', 'power_three'],
      cssClass: 'scientific-advanced'
    };

    var types = {};
    types.basic = { 
      name: 'Basic',
      regions: ['clear', 'numbers', 'basic']
    };
    types.scientific = { 
      name: 'Scientific',
      regions: ['clear', 'memory', 'angular_measure', 'numbers', 'scientific_basic', 'scientific_advanced']
    };

    var factorial = function(num){
      if (num <= 0) {
        return 1;
      } else {
        return num * factorial( num - 1 );
      }
    };

    var log10 = function(val) {
      return Math.log(val) / Math.LN10;
    };

    var toRadians = function(value) {
      return value * (Math.PI/180);
    };

    var toDegrees = function(value) {
      return value * (180/Math.PI);
    };

    var trigonometricValue = function(value, from, to){
      if(from === to) {
        return value;
      } else {
        if(to === angularUnits.DEGREES) {
          return toDegrees(value);
        } else if(to === angularUnits.RADIANS) {
          return toRadians(value);
        }
      }
      
      return value;
    };
    
    function CalculatorConfig() {

      this.postLink = function(scope) {
        scope.types = types;
        scope.regions = regions;
        scope.buttons = buttons;
        scope.angularUnits = angularUnits;
      };      
    }

    return CalculatorConfig;
  }
];

exports.framework = "angular";
exports.factory = calculatorConfig;