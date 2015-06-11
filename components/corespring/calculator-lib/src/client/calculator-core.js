var calculatorCore = [
  'CalculatorConfig',
  function(CalculatorConfig) {

    function CalculatorCore(_scope, input) {
      
      var self = this;
      var config = {};
      var calculatorConfig = new CalculatorConfig();
      calculatorConfig.postLink(config);
      var resultsInput = input;
      var scope = _scope;

      this.results = 0;
      this.pendingOperation = '';
      this.newInput = true;
      this.state = '';

      this.clickNumber = function(button) {
        var val;
        if(self.newInput) {
          val = '';
          self.newInput = false;
        } else {
          val = resultsInput.val();
        }

        resultsInput.val(val + config.buttons[button].symbol);
      };

      this.clickOperator = function(button, operatorType) {
        if(operatorType === 'unary') {
          self.clickUnaryOperator(button);
        } else {
          self.clickBinaryOperator(button);
        }        
      };

      this.clickUnaryOperator = function(button) {
        switch(button) {
          case 'equal':
            scope.$emit('resolveOperation');
            break;
          default:
            break;          
        }
        self.pendingOperation = '';
        self.newInput = true;
      };

      this.clickBinaryOperator = function(button) {
        this.pendingOperation = button;
      };

      this.clickMisc = function(button) {
        switch(button){
          case 'backspace':
            resultsInput.val(resultsInput.val().slice(0, - 1));
            break;
          case 'clear':
            clearResults();
            break;
          default:
            break;
        }
      };

      this.executeFunctionByName = function(functionName, context /*, args */) {
        var args = [].slice.call(arguments).splice(2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for(var i = 0; i < namespaces.length; i++) {
          context = context[namespaces[i]];
        }
        return context[func].apply(this, args);
      };

      function clearResults() {
        resultsInput.val('');
        self.results = 0;
        self.pendingOperation = '';
        self.newInput = true;
      }
    }

    return CalculatorCore;
  }
];

exports.framework = "angular";
exports.factory = calculatorCore;