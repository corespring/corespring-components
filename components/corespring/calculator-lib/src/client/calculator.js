var calculator = [
  'CalculatorConfig',
  function(CalculatorConfig) {

    function Calculator(_scope, _input) {
      
      var self = this;
      var input = _input;
      var scope = _scope;

      this.pendingOperationIsBinary = false;
      this.lastPressedIsBinary = false;
      this.operandContinue = false;
      
      this.storedValue = '';
      this.previousOperator = '';
      
      this.state = '';
      this.memory = '';
      this.angularMeasure = 'degrees';
      
      // this.lazyEvaluation = false;
      // this.lazyInputClearFlag = true;

      this.operationStatus = [];

      this.extendScope = function(scope, componentType) {
        new CalculatorConfig().postLink(scope);
      };

      this.click = function(button, ref) {        
        // if(this.state !== 'error' || button === 'clear') {
          var functionName, optionalArgs;
          functionName = 'click' + button.type;

          this.executeFunctionByName(functionName, self, button, optionalArgs);          
        // }
      };

      this.clickNumber = function(button) {
        // check for multiple dots or alone dots
        if(button.id === 'dot'){
          var value = input.val();
          if(!self.operandContinue || value.indexOf('.') !== -1){
            return;
          }          
        }
        self.clickOperand(button.symbol);
        self.operandContinue = true;
      };

      this.clickConstant = function(button) {
        // check if there are no operator
        if(self.previousOperator === ''){
          self.previousOperator = 'multiply';
          this.operandContinue = false;
        }

        // click operand with correct value
        switch(button.id) {
          case 'pi':
            self.clickOperand(Math.PI);
            break;
        }

        // make sure new input is treated as a new operand
        this.operandContinue = false;
        self.previousOperator = 'multiply';
      };

      this.clickOperand = function(button) {
        if (this.operandContinue) {
          input.val(input.val() + button);
        } else {
          input.val(button);
        }
        self.lastPressedIsBinary = false;
      };

      this.clickOperator = function(button) {
        var value = parseFloat(input.val());
        if(button.numOfOperands === '1') {
          self.clickUnaryOperator(value, button);
        } else {
          self.clickBinaryOperator(value, button);
        }
      };

      this.clickUnaryOperator = function(inputValue, button) {
        var value = '';

        switch(button.id) {
          case 'equals':
            while(self.operationStatus.length > 0) {
              self.pullSubresult();              
            }
            self.solveOperation(button);
            value = self.storedValue;
            break;
          case 'sqrt':
            value = Math.sqrt(inputValue);
            break;
          case 'change_sign':
            value = inputValue * -1;
            break;
          case 'abs':
            value = Math.abs(inputValue);
            break;
          case 'sin':
            value = Math.sin(this.trigonometricValue(inputValue));
            break;
          case 'asin':
            value = Math.asin(this.trigonometricValue(inputValue));
            break;
          case 'cos':
            value = Math.cos(this.trigonometricValue(inputValue));
            break;
          case 'acos':
            value = Math.acos(this.trigonometricValue(inputValue));
            break;
          case 'tan':
            value = Math.tan(this.trigonometricValue(inputValue));
            break;
          case 'atan':
            value = Math.atan(this.trigonometricValue(inputValue));
            break;
          case 'ex':
            value = Math.exp(inputValue);
            break;
          case 'ln':
            value = Math.log(inputValue);
            break;
          case 'log':
            value = Math.log10(inputValue);
            break;
          case 'factorial':
            value = this.factorial(Math.round(inputValue));
            break;
          case 'onex':
            value = 1 / inputValue;
            break;
          case 'power_two':
            value = Math.pow(inputValue, 2);
            break;
          case 'power_three':
            value = Math.pow(inputValue, 3);
            break;
        }        

        self.lastPressedIsBinary = false;
        self.operandContinue = false;

        input.val(value);
      };

      this.clickBinaryOperator = function(value, button) {

        if(!self.lastPressedIsBinary && self.pendingOperationIsBinary && self.storedValue !== '' && self.previousOperator.length > 0) {
          // resolve operation
          self.solveOperation(button);
        } else {
          if (self.lastPressedIsBinary) {
            // operator after operator
            self.previousOperator = button.id;
          } else {
            // new operation, just store the value and set the previousOperator
            self.storedValue = value;
            self.previousOperator = button.id;
            self.operandContinue = false;
          }
        }

        self.pendingOperationIsBinary = true;
        self.lastPressedIsBinary = true;
      };

      this.clickMisc = function(button) {
        switch(button.id){
          case 'backspace':
            var newValue = (self.operandContinue) ? input.val().slice(0, - 1) : '';

            if(self.operandContinue) {
              newValue = input.val().slice(0, - 1);
            } else {
            }            
            if(newValue === '') {
              self.operandContinue = false;
              self.pendingOperationIsBinary = self.previousOperator !== '';
              self.lastPressedIsBinary = self.previousOperator !== '';
            }
            input.val(newValue);
            break;
          case 'clear':
            self.resetOperationStatus();
            self.operationStatus = [];
            input.val('');
            break;
          case 'store':
            this.memory = input.val();
            break;
          case 'recall':
            input.val(this.memory);
            break;
          case 'left_parenthesis':
            self.pushSubresult();
            break;
          case 'right_parenthesis':
            self.pullSubresult();
            break;
        }
      };

      this.pushSubresult = function() {
        if((!self.lastPressedIsBinary || self.previousOperator === '') && input.val() !== '') {
          self.clickOperator(scope.buttons.multiply);
        }

        self.operationStatus.push({
          'storedValue': self.storedValue,
          'previousOperator': self.previousOperator,
          'pendingOperationIsBinary': self.pendingOperationIsBinary,
          'lastPressedIsBinary': self.lastPressedIsBinary,
          'operandContinue': self.operandContinue
        });
        self.resetOperationStatus();
      };

      this.pullSubresult = function() {
        if(self.operationStatus.length > 0) {
          if(self.previousOperator.length === 0) {
            self.storedValue = input.val();
          } else {
            self.solveOperation(scope.buttons.equals);
            if(self.operandContinue) {
              self.lastPressedIsBinary = false;
            } else {
              if(self.storedValue === '') {
                self.storedValue = input.val();
              }
            }
          }

          input.val(self.storedValue);

          var status = self.operationStatus.pop();
          self.storedValue = status.storedValue;
          self.previousOperator = status.previousOperator;
          self.pendingOperationIsBinary = status.pendingOperationIsBinary;
          self.lastPressedIsBinary = false;
          self.operandContinue = status.operandContinue;

          if(self.previousOperator === '' && self.storedValue === '') {
            self.storedValue = input.val();
          }
        }        
      };

      this.resetOperationStatus = function() {
        self.storedValue = '';
        self.previousOperator = '';
        self.pendingOperationIsBinary = false;
        self.lastPressedIsBinary = false;
        self.operandContinue = false;
      };

      this.solveOperation = function(button) {
        var inputValue = parseFloat(input.val());

        if(!self.lastPressedIsBinary) {
          switch(self.previousOperator) {
            case 'plus':
              self.storedValue = self.storedValue + inputValue;
              break;
            case 'minus':
              self.storedValue = self.storedValue - inputValue;
              break;
            case 'multiply':
              self.storedValue = self.storedValue * inputValue;
              break;
            case 'divide':
              self.storedValue = self.storedValue / inputValue;
              break;
            case 'power':
              self.storedValue = Math.pow(self.storedValue, inputValue);
              break;
          }
        }
                
        self.operandContinue = false;
        self.previousOperator = button.id === 'equals' ? '' : button.id;
        input.val(self.storedValue);
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

      this.trigonometricValue = function(value){
        if(self.angularMeasure === 'degrees'){
          return value * (Math.PI/180);
        }
        return value;
      };

      this.factorial = function(num){
        if (num <= 0) {
          return 1;
        } else {
          return num * this.factorial( num - 1 );
        }
      };      
    }

    return Calculator;
  }
];

exports.framework = "angular";
exports.factory = calculator;