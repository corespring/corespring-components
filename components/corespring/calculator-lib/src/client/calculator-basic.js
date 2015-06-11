var calculatorBasic = [
  'CalculatorCore',
  'CalculatorConfig',
  function(CalculatorCore, CalculatorConfig) {

    var calculatorCore;

    function CalculatorBasic(_scope, input) {

      var self = this;      
      var resultsInput = input;     
      var scope = _scope; 
      calculatorCore = new CalculatorCore(scope, resultsInput);
      scope.$on('resolveOperation', function(){ self.resolveOperation(calculatorCore.pendingOperation); });

      this.extendScope = function(scope, componentType) {
        new CalculatorConfig().postLink(scope);
      };

      this.click = function(button, type, logic) {
        if(calculatorCore.state !== 'error' || button === 'clear') {
          var context = (logic === 'basic') ? self : calculatorCore;
          var functionName, optionalArgs;

          if(type.indexOf('Operator') !== -1) {
            var typeParts = type.split('_');
            optionalArgs = typeParts[0];
            functionName = 'click' + typeParts[1];
          } else {
            functionName = 'click' + type;
          }

          calculatorCore.executeFunctionByName(functionName, context, button, optionalArgs);
        }
      };

      this.clickOperator = function(button, operatorType) {
        if(operatorType === 'unary') {
          self.clickUnaryOperator(button);
        } else {
          self.clickBinaryOperator(button);
        }
      };

      this.clickUnaryOperator = function(button) {
        var input = parseFloat(resultsInput.val());
        switch(button) {
          case 'sqrt':
            calculatorCore.results = Math.sqrt(input);
            resultsInput.val(calculatorCore.results);
            break;
          default:
            break;
        }

        calculatorCore.pendingOperation = '';
        calculatorCore.newInput = true;
      };

      this.clickBinaryOperator = function(button) {
        self.resolveOperation(button);

        calculatorCore.pendingOperation = button;
        calculatorCore.newInput = true;
      };

      this.resolveOperation = function(button) {
        var input = parseFloat(resultsInput.val());

        if(calculatorCore.pendingOperation !== '') {
          if (calculatorCore.newInput) {
            calculatorCore.pendingOperation = button;
          } else {
            switch(calculatorCore.pendingOperation) {
              case 'plus':
                calculatorCore.results = calculatorCore.results + input;
                break;
              case 'minus':
                calculatorCore.results = calculatorCore.results - input;
                break;
              case 'multiply':
                calculatorCore.results = calculatorCore.results * input;
                break;
              case 'divide':
                if(resultsInput.val() === '0') {
                  calculatorCore.results = 'Error';
                  calculatorCore.pendingOperation = '';
                  calculatorCore.newInput = true;
                  calculatorCore.state = 'error';
                } else {
                  calculatorCore.results = calculatorCore.results / input;
                }
                break;
              default:
                break;
            } 
            resultsInput.val(calculatorCore.results);
          }          
        } else {
          calculatorCore.results = parseFloat(resultsInput.val());
        }
      };
    }    

    return CalculatorBasic;
  }
];

exports.framework = "angular";
exports.factory = calculatorBasic;