var calculator = [
  'CalculatorConfig',
  function(CalculatorConfig) {

    function Calculator(scope) {
      var self = this;

      this.pendingOperationIsBinary = false;
      this.lastPressedIsBinary = false;
      this.operandContinue = false;
      
      this.storedValue = '';
      this.previousOperator = '';
      
      this.state = '';
      this.memory = '';
      this.angularMeasure = '';

      this.operationStatus = [];

      this.extendScope = function(scope, componentType) {
        new CalculatorConfig().postLink(scope);
        this.angularMeasure = scope.angularUnits.DEGREES;
      };

      this.click = function(button) {
        if(this.state === 'NaN') {
          this.clickMisc(scope.buttons.clear);
        }

        var functionName, optionalArgs;
        functionName = 'click' + button.type;
        this.executeFunctionByName(functionName, self, button, optionalArgs);
      };

      this.clickNumber = function(button) {
        // check for multiple or alone decimal points
        if(button.id === 'decimal'){
          if (self.operandContinue && scope.results.indexOf('.') !== -1) {
            return;
          }
          
          if(!self.operandContinue) {
            scope.results = "0";
            this.operandContinue = true;
          }
        }
        self.clickOperand(button.operand);
        self.operandContinue = true;
      };

      this.clickConstant = function(button) {
        // if there are no operation in progress, it assumes a multiplication
        if(self.previousOperator === ''){
          self.click(scope.buttons.multiply);
          this.operandContinue = false;
        }

        self.clickOperand(button.operand);

        // make sure new input is treated as a new operand
        this.operandContinue = false;
        if(!self.previousOperator || self.previousOperator === ''){
          self.previousOperator = 'multiply';
        }
      };

      this.clickOperand = function(button) {
        if (this.operandContinue) {
          scope.results = scope.results + button;
        } else {
          scope.results = button;
        }
        self.lastPressedIsBinary = false;
      };

      this.clickOperator = function(button) {
        var value = parseFloat(scope.results);
        if(button.numOfOperands === '1') {
          self.clickUnaryOperator(value, button);
        } else {
          self.clickBinaryOperator(value, button);
        }
      };

      this.clickUnaryOperator = function(inputValue, button) {
        var value = '';

        switch(button.id) {
          case 'sin':
          case 'asin':
          case 'cos':
          case 'acos':
          case 'tan':
          case 'atan':
            value = button.operation(inputValue, self.angularMeasure);
            break;
          case 'equals':
            while(self.operationStatus.length > 0) {
              self.pullSubresult();              
            }
            self.solveOperation(button);
            value = self.storedValue;
            break;
          default:
            value = button.operation(inputValue);
            break;
        }        

        self.lastPressedIsBinary = false;
        self.operandContinue = false;
        // self.storedValue = value;

        if(self.checkNaN()){
          scope.results = value;
        }
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
            var newValue = (self.operandContinue) ? scope.results.slice(0, - 1) : '';

            if(self.operandContinue) {
              newValue = scope.results.slice(0, - 1);
            }            
            if(newValue === '') {
              self.operandContinue = false;
              self.pendingOperationIsBinary = self.previousOperator !== '';
              self.lastPressedIsBinary = self.previousOperator !== '';
            }
            scope.results = newValue;
            break;
          case 'clear':
            self.resetOperationStatus();
            self.operationStatus = [];
            self.state = '';
            scope.results = '';
            break;
          case 'store':
            var value = scope.results;
            if(value !== '') {
              this.memory = scope.results;
            }
            break;
          case 'recall':
            scope.results = this.memory;
            break;
          case 'left_parenthesis':
            self.pushSubresult();
            scope.results = button.symbol;
            break;
          case 'right_parenthesis':
            self.pullSubresult();
            break;
          case 'degrees':
          case 'radians':
            self.angularMeasure = button.id;            
            break;
        }
      };

      /* When a parenthesis is open, all the operation between the parenthesis is treated as new isolated operation
       * so all the current operation status is saved until the parenthesis are closed.
       * When the parenthesis operation is closed, the result is calculated and used as an operand for the parent operation       
       */
      this.pushSubresult = function() {
        if((!self.lastPressedIsBinary || self.previousOperator === '') && scope.results !== '') {
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
            self.storedValue = scope.results;
          } else {
            self.solveOperation(scope.buttons.equals);
            if(self.operandContinue) {
              self.lastPressedIsBinary = false;
            } else {
              if(self.storedValue === '') {
                self.storedValue = scope.results;
              }
            }
          }

          if(self.checkNaN()){
            scope.results = self.storedValue;

            var status = self.operationStatus.pop();
            self.storedValue = status.storedValue;
            self.previousOperator = status.previousOperator;
            self.pendingOperationIsBinary = status.pendingOperationIsBinary;
            self.lastPressedIsBinary = false;
            self.operandContinue = status.operandContinue;

            if(self.previousOperator === '' && self.storedValue === '') {
              self.storedValue = scope.results;
            }
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
        var inputValue = parseFloat(scope.results);

        if(!self.lastPressedIsBinary) {
          self.storedValue = scope.buttons[self.previousOperator].operation(self.storedValue, inputValue);
        }
                
        self.operandContinue = false;
        self.previousOperator = button.id === 'equals' ? '' : button.id;
        if(self.checkNaN()){
          scope.results = self.storedValue;
        }
      };

      this.executeFunctionByName = function(functionName, context) {
        var args = [].slice.call(arguments).splice(2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for(var i = 0; i < namespaces.length; i++) {
          context = context[namespaces[i]];
        }
        return context[func].apply(this, args);
      };

      this.checkNaN = function(){
        var isNumber = isFinite(self.storedValue);
        if(!isNumber) {
          this.state = 'NaN';
          scope.results = 'Error';
        }

        return isNumber;
      };
    }

    return Calculator;
  }
];

exports.framework = "angular";
exports.factory = calculator;