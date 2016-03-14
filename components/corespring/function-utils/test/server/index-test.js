/* jshint loopfunc: true */
var server = require('../../src/server');
var assert = require('assert');
var should = require('should');
var _ = require('lodash');


describe('random point generator', function() {
  it('domain', function() {
    var domain = {
      include: ["-5,-4", "-1,1", "5,6", "8,10"],
      exclude: [7, 9]
    };

    // 500 iterations for sufficient sample size
    for (var i = 0; i < 500; i++) {
      var result = server.generateRandomPointsForDomain(domain, 50, 3);

      var allNumbersAreInRanges = _.every(result, function(number) {
        for (var i = 0; i < domain.include.length; i++) {
          var min = Number(domain.include[i].split(",")[0]);
          var max = Number(domain.include[i].split(",")[1]);
          if (number >= min && number <= max) {
            return true;
          }
        }
        return false;
      });

      var noNumbersIsFromExcluded = _.every(result, function(number) {
        return !_.contains(domain.exclude, number);
      });

      result.length.should.eql(50);
      allNumbersAreInRanges.should.eql(true);
      noNumbersIsFromExcluded.should.eql(true);
    }
  });

});

describe('expressionize', function() {
  it('accepts null', function(){
    var result = server.expressionize(null, 'x');
    result.should.eql('');
  });

  it('accepts undefined', function(){
    var result = server.expressionize(undefined, 'x');
    result.should.eql('');
  });

  it('trims spaces', function() {
    var eq = "  12x +   3   ";
    var result = server.expressionize(eq, 'x');
    result.should.eql("12*(x)+3");
  });

  it('inserts * after 12', function() {
    var eq = "12x+3";
    var result = server.expressionize(eq, 'x');
    result.should.eql("12*(x)+3");
  });

  it('inserts * before 12', function() {
    var eq = "x12+3";
    var result = server.expressionize(eq, 'x');
    result.should.eql("(x)*12+3");
  });

  it('inserts * after 5 and before 12', function() {
    var eq = "5x12+3";
    var result = server.expressionize(eq, 'x');
    result.should.eql("5*(x)*12+3");
  });

  it('inserts * after (10-5)', function() {
    var eq = "(10-5)x+(32/4)";
    var result = server.expressionize(eq, 'x');
    result.should.eql("(10-5)*(x)+(32/4)");
  });

  it('inserts * after (x-5)', function() {
    var eq = "(x-5)(x+5)";
    var result = server.expressionize(eq, 'x');
    result.should.eql("((x)-5)*((x)+5)");
  });

  it('inserts * after 3', function() {
    var eq = "3(2+1)";
    var result = server.expressionize(eq, 'x');
    result.should.eql("3*(2+1)");
  });

  it('inserts * before 3', function() {
    var eq = "(2+1)3";
    var result = server.expressionize(eq, 'x');
    result.should.eql("(2+1)*3");
  });
});

describe('linear function equal logic', function() {

  it('identical functions are equal', function() {
    var eq1 = "3x+5";
    var eq2 = "3x+5";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('different functions are not equal', function() {
    var eq1 = "3x+5";
    var eq2 = "3x+6";
    server.isFunctionEqual(eq1, eq2).should.eql(false);
  });

  it('same slope (fraction)', function() {
    var eq1 = "3x+5";
    var eq2 = "(6/2)x+5";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same slope (multiplication)', function() {
    var eq1 = "3x+5";
    var eq2 = "1.5*2x+5";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same slope (complex expression)', function() {
    var eq1 = "3x+5";
    var eq2 = "(15-5-7)x+5";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same y-intercept (fraction)', function() {
    var eq1 = "3x+5";
    var eq2 = "3x+(10/2)";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same y-intercept (multiplication)', function() {
    var eq1 = "3x+5";
    var eq2 = "3x+2.5*2";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same y-intercept (complex expression)', function() {
    var eq1 = "3x+5";
    var eq2 = "3x+(2+12/4)";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('different variable name than x', function() {
    var eq1 = "3g+5";
    var eq2 = "3g+(2+12/4)";
    server.isFunctionEqual(eq1, eq2, {
      variable: 'g'
    }).should.eql(true);
  });

  it('precision is up to 10^-sigfigs', function() {
    var eq1 = "3x+5";
    var eq2 = "3x+5.0005";
    server.isFunctionEqual(eq1, eq2, {
      sigfigs: 3
    }).should.eql(true);
    server.isFunctionEqual(eq1, eq2, {
      sigfigs: 4
    }).should.eql(false);
  });

  it('invalid equation should evaluate to incorrect', function() {
    var eq1 = "3x+5";
    var eq2 = "something";
    server.isFunctionEqual(eq1, eq2).should.eql(false);
  });
});

describe('equation correctness logic', function() {

  it('identical equation is correct', function() {
    var correctEq = "y=3x+5";
    var testEq = "y=3x+5";
    server.isEquationCorrect(correctEq, testEq).should.eql(true);
  });

  it('omitted left side is correct', function() {
    var correctEq = "3x+5";
    var testEq = "3x+5";
    server.isEquationCorrect(correctEq, testEq).should.eql(true);
  });

  it('omitted left side of test eq is correct', function() {
    var correctEq = "y=3x+5";
    var testEq = "3x+5";
    server.isEquationCorrect(correctEq, testEq).should.eql(true);
  });

  it('reshuffled equation is correct', function() {
    var correctEq = "y=3x+5";
    var testEq = "y-5=3x";
    server.isEquationCorrect(correctEq, testEq).should.eql(true);
  });

  it('reshuffled equation is correct, case 2', function() {
    var correctEq = "y=3x+5";
    var testEq = "3x=y-5";
    server.isEquationCorrect(correctEq, testEq).should.eql(true);
  });

  it('decimal slope in fraction form is correct', function() {
    var correctEq = "y=0.5x+5";
    var testEq = "y=(1/2)x+5";
    server.isEquationCorrect(correctEq, testEq).should.eql(true);
  });

  it('fraction slope in decimal form is correct', function() {
    var correctEq = "y=(1/2)x+5";
    var testEq = "y=0.5x+5";
    server.isEquationCorrect(correctEq, testEq).should.eql(true);
  });

  it('equal equation in different form is correct', function() {
    var correctEq = "y=3x+5";
    var testEq = "y=(1+2)x+2+3";
    server.isEquationCorrect(correctEq, testEq).should.eql(true);
  });

  it('different coefficient is incorrect', function() {
    var correctEq = "y=3x+5";
    var testEq = "y=2x+5";
    server.isEquationCorrect(correctEq, testEq).should.eql(false);
  });

  it('different addition is incorrect', function() {
    var correctEq = "y=3x+5";
    var testEq = "y=3x+4";
    server.isEquationCorrect(correctEq, testEq).should.eql(false);
  });

  it('inverse equation is incorrect', function() {
    var correctEq = "y=3x+5";
    var testEq = "y=-(3x+5)";
    server.isEquationCorrect(correctEq, testEq).should.eql(false);
  });

  it('simple letter equation is incorrect (CO-124)', function() {
    var correctEq = "y=3x+5";
    var testEq = "y";
    server.isEquationCorrect(correctEq, testEq).should.eql(false);
  });

  it('simple identity equation is incorrect (CO-124)', function() {
    var correctEq = "y=3x+5";
    var testEq = "y=y";
    server.isEquationCorrect(correctEq, testEq).should.eql(false);
  });

  it('simple identity equation with x is incorrect (CO-124)', function() {
    var correctEq = "y=3x+5";
    var testEq = "y-x=y-x";
    server.isEquationCorrect(correctEq, testEq).should.eql(false);
  });

});