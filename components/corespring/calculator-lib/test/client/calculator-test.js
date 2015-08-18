/* global describe, beforeEach, inject, module, it, expect */

describe('corespring:calculator-lib:calculator', function() {
  'use strict';

  var scope;
  var calculator;
  var decimalPrecision = 5;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($rootScope, Calculator) {
    scope = $rootScope.$new();
    calculator = new Calculator(scope);
    calculator.extendScope(scope, 'calculator-test');
    scope.$digest();
  }));

  afterEach(function() {
    calculator.click(scope.buttons.clear);
  });

  it('should be defined', function() {
    expect(scope).toBeDefined();
  });

  describe('numbers and constants', function(){

    it('should be able to enter multiple digits numbers', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.three);
      expect(scope.results).toEqual('53');
    });

    it('should not allow to enter multiple decimal points', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.decimal);
      calculator.click(scope.buttons.decimal);
      calculator.click(scope.buttons.three);
      calculator.click(scope.buttons.decimal);
      expect(scope.results).toEqual('5.3');
    });

    it('should include the zero, if decimal button is pressed with no numbers', function() {
      calculator.click(scope.buttons.decimal);
      calculator.click(scope.buttons.three);
      expect(scope.results).toEqual('0.3');
    });

    it('should allow to enter constants', function() {
      calculator.click(scope.buttons.pi);
      expect(scope.results).toEqual(3.141592653589793);
    });

  });

  describe('clear functions', function(){

    it('should be able to backspace a digit', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.two);
      calculator.click(scope.buttons.three);
      calculator.click(scope.buttons.backspace);
      expect(scope.results).toEqual('52');
    });

    it('should be able to clear results', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.two);
      calculator.click(scope.buttons.three);
      calculator.click(scope.buttons.clear);

      expect(scope.results).toEqual('');
      expect(calculator.operationStatus).toEqual([]);
      expect(calculator.state).toEqual('');
      expect(calculator.storedValue).toEqual('');
      expect(calculator.previousOperator).toEqual('');
      expect(calculator.pendingOperationIsBinary).toEqual(false);
      expect(calculator.lastPressedIsBinary).toEqual(false);
      expect(calculator.operandContinue).toEqual(false);
    });

  });

  describe('basic functions', function(){

    it('should be able to sum two numbers', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.plus);
      calculator.click(scope.buttons.three);
      calculator.click(scope.buttons.equals);
      expect(scope.results).toEqual(8);
    });

    it('should be able to substract two numbers', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.minus);
      calculator.click(scope.buttons.three);
      calculator.click(scope.buttons.equals);
      expect(scope.results).toEqual(2);
    });

    it('should be able to multiply two numbers', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.multiply);
      calculator.click(scope.buttons.three);
      calculator.click(scope.buttons.equals);
      expect(scope.results).toEqual(15);
    });

    it('should be able to divide two numbers', function() {
      calculator.click(scope.buttons.two);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.divide);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.equals);
      expect(scope.results).toEqual(5);
    });

    it('should show Error when trying to divide by zero', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.divide);
      calculator.click(scope.buttons.zero);
      calculator.click(scope.buttons.equals);
      expect(scope.results).toEqual('Error');
    });

    it('should calculate square root of a number', function() {
      calculator.click(scope.buttons.two);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.sqrt);      
      expect(scope.results).toEqual(5);
    });

    it('should change sign of a number', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.change_sign);
      expect(scope.results).toEqual(-5);
    });

    it('should calculate absolute value of a number', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.abs);
      expect(scope.results).toEqual(5);

      calculator.click(scope.buttons.clear);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.change_sign);
      calculator.click(scope.buttons.abs);
      expect(scope.results).toEqual(5);
    });

  });

  describe('memory functions', function(){

    it('should store current results to memory', function() {
      calculator.click(scope.buttons.two);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.store);
      expect(calculator.memory).toEqual('25');
    });

    it('should bring memory value to ', function() {
      calculator.click(scope.buttons.two);      
      calculator.click(scope.buttons.store);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.recall);
      expect(calculator.memory).toEqual('2');
    });

  });

  describe('degrees radians functions', function(){

    var radians45 = 0.785398163;
    var radians90 = 1.570796327;

    it('should use degrees when indicated', function() {
      calculator.click(scope.buttons.degrees);
      scope.results = 90;
      calculator.click(scope.buttons.sin);
      expect(scope.results).toEqual(1);
    });

    it('should use degrees by default', function() {
      scope.results = 90;
      calculator.click(scope.buttons.sin);
      expect(scope.results).toEqual(1);
    });

    it('should use radians when indicated', function() {
      calculator.click(scope.buttons.radians);
      scope.results = radians90;
      calculator.click(scope.buttons.sin);
      expect(scope.results).toBeCloseTo(1);
    });

  });

  describe('advanced functions', function(){

    describe('trigonometric functions', function(){      

      describe('in degrees', function(){

        beforeEach(function() {
          calculator.click(scope.buttons.degrees);
        });

        it('should allow to calculate sin', function() {
          scope.results = 90;
          calculator.click(scope.buttons.sin);
          expect(scope.results).toEqual(1);
        });

        it('should allow to calculate cos', function() {
          scope.results = 0;
          calculator.click(scope.buttons.cos);
          expect(scope.results).toEqual(1);
        });

        it('should allow to calculate tan', function() {
          scope.results = 45;
          calculator.click(scope.buttons.tan);
          expect(scope.results).toBeCloseTo(1, decimalPrecision);
        });

        it('should allow to calculate sin-1', function() {
          scope.results = 1;
          calculator.click(scope.buttons.asin);
          expect(scope.results).toEqual(90);
        });

        it('should allow to calculate cos-1', function() {
          scope.results = 0;
          calculator.click(scope.buttons.acos);
          expect(scope.results).toEqual(90);
        });

        it('should allow to calculate tan-1', function() {
          scope.results = 1;
          calculator.click(scope.buttons.atan);
          expect(scope.results).toEqual(45);
        });

      });

      describe('in radians', function(){

        var radians45 = 0.785398163;
        var radians90 = 1.570796327;

        beforeEach(function() {
          calculator.click(scope.buttons.radians);
        });

        it('should allow to calculate sin', function() {
          scope.results = radians90;
          calculator.click(scope.buttons.sin);
          expect(scope.results).toEqual(1);
        });

        it('should allow to calculate cos', function() {
          scope.results = 0;
          calculator.click(scope.buttons.cos);
          expect(scope.results).toEqual(1);
        });

        it('should allow to calculate tan', function() {
          scope.results = radians45;
          calculator.click(scope.buttons.tan);
          expect(scope.results).toBeCloseTo(1, decimalPrecision);
        });

        it('should allow to calculate sin-1', function() {
          scope.results = 1;
          calculator.click(scope.buttons.asin);
          expect(scope.results).toBeCloseTo(radians90, decimalPrecision);
        });

        it('should allow to calculate cos-1', function() {
          scope.results = 0;
          calculator.click(scope.buttons.acos);
          expect(scope.results).toBeCloseTo(radians90, 5);
        });

        it('should allow to calculate tan-1', function() {
          scope.results = 1;
          calculator.click(scope.buttons.atan);
          expect(scope.results).toBeCloseTo(radians45, decimalPrecision);
        });
        
      });

    });

    it('should allow to calculate e^x', function() {
      calculator.click(scope.buttons.two);
      calculator.click(scope.buttons.ex);
      expect(scope.results).toBeCloseTo(7.38905609893065, decimalPrecision);
    });


    it('should allow to calculate ln', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.ln);
      expect(scope.results).toBeCloseTo(1.60943791243, decimalPrecision);
    });
    
    it('should allow to calculate log', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.log);
      expect(scope.results).toBeCloseTo(0.69897000433, 5);
    });

    it('should allow to calculate factorial', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.factorial);
      expect(scope.results).toEqual(120);
    });

    it('should allow to calculate 1/x', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.onex);
      expect(scope.results).toEqual(0.2);
    });

    it('should allow to calculate power', function() {
      calculator.click(scope.buttons.two);
      calculator.click(scope.buttons.power);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.equals);
      expect(scope.results).toEqual(32);
    });

    it('should allow to calculate second power (square)', function() {      
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.power_two);
      expect(scope.results).toEqual(25);
    });

    it('should allow to calculate third power (cube)', function() {
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.power_three);
      expect(scope.results).toEqual(125);
    });

  });

  // currently the calculator only supports two operans at a time
  // this affects how to enter the operands
  // for instance:
  // sqrt (3 * 5 + 10)
  // should be entered
  // 3 * 5 + 10 = sqrt
  describe('combined operations', function(){

    it('should resolve combined operations without parenthesis', function() {
      // sqrt (3 * 5 + 10)
      calculator.click(scope.buttons.three);
      calculator.click(scope.buttons.multiply);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.plus);
      calculator.click(scope.buttons.one);
      calculator.click(scope.buttons.zero);      
      calculator.click(scope.buttons.equals);
      calculator.click(scope.buttons.sqrt);
      expect(scope.results).toEqual(5);
    });

    it('should resolve combined operations without parenthesis', function() {
      // 25 + (3 * 5 + 10)
      calculator.click(scope.buttons.two);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.plus);
      calculator.click(scope.buttons.left_parenthesis);
      calculator.click(scope.buttons.three);
      calculator.click(scope.buttons.multiply);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.plus);
      calculator.click(scope.buttons.one);
      calculator.click(scope.buttons.zero);
      calculator.click(scope.buttons.right_parenthesis);
      calculator.click(scope.buttons.equals);
      expect(scope.results).toEqual(50);
    });

    it('should resolve unclosed parenthesis when pressing equals button', function() {
      // 25 + (3 * 5 + (5 + 5
      calculator.click(scope.buttons.two);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.plus);
      calculator.click(scope.buttons.left_parenthesis);
      calculator.click(scope.buttons.three);
      calculator.click(scope.buttons.multiply);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.plus);
      calculator.click(scope.buttons.left_parenthesis);
      calculator.click(scope.buttons.five);
      calculator.click(scope.buttons.plus);       
      calculator.click(scope.buttons.five);     
      calculator.click(scope.buttons.equals);    
      expect(scope.results).toEqual(50);
    });

  });

});