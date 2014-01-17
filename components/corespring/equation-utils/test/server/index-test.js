var server = require('../../src/server');
var assert = require('assert');
var should = require('should');
var _ = require('lodash');


describe('expressionize', function () {
  it('takes only the right side of the equation', function () {
    var eq = "y=12x+3";
    var result = server.expressionize(eq, 'x');
    result.should.eql("12*(x)+3");

    var eq = "12x+3";
    var result = server.expressionize(eq, 'x');
    result.should.eql("12*(x)+3");
  });

  it('trims spaces', function () {
    var eq = "y   =   12x +   3   ";
    var result = server.expressionize(eq, 'x');
    result.should.eql("12*(x)+3");
  });

  it('inserts * where adequate in a simple expression', function () {
    var eq = "y=12x+3";
    var result = server.expressionize(eq, 'x');
    result.should.eql("12*(x)+3");
  });

  it('inserts * where adequate in a complex expression', function () {
    var eq = "y=(10-5)x+(32/4)";
    var result = server.expressionize(eq, 'x');
    result.should.eql("(10-5)*(x)+(32/4)");
  });
});

describe('linear equation equal logic', function () {

  it('identical equations are equal', function () {
    var eq1 = "y=3x+5";
    var eq2 = "y=3x+5";
    server.isEquationEqual(eq1, eq2).should.eql(true);
  });

  it('same slope (fraction)', function () {
    var eq1 = "y=3x+5";
    var eq2 = "y=(6/2)x+5";
    server.isEquationEqual(eq1, eq2).should.eql(true);
  });

  it('same slope (multiplication)', function () {
    var eq1 = "y=3x+5";
    var eq2 = "y=1.5*2x+5";
    server.isEquationEqual(eq1, eq2).should.eql(true);
  });

  it('same slope (complex expression)', function () {
    var eq1 = "y=3x+5";
    var eq2 = "y=(15-5-7)x+5";
    server.isEquationEqual(eq1, eq2).should.eql(true);
  });

  it('same y-intercept (fraction)', function () {
    var eq1 = "y=3x+5";
    var eq2 = "y=3x+(10/2)";
    server.isEquationEqual(eq1, eq2).should.eql(true);
  });

  it('same y-intercept (multiplication)', function () {
    var eq1 = "y=3x+5";
    var eq2 = "y=3x+2.5*2";
    server.isEquationEqual(eq1, eq2).should.eql(true);
  });

  it('same y-intercept (complex expression)', function () {
    var eq1 = "y=3x+5";
    var eq2 = "y=3x+(2+12/4)";
    server.isEquationEqual(eq1, eq2).should.eql(true);
  });

  it('different variable name than x', function () {
    var eq1 = "y=3g+5";
    var eq2 = "y=3g+(2+12/4)";
    server.isEquationEqual(eq1, eq2, {variable: 'g'}).should.eql(true);
  });

  it('precision is up to 10^-sigfigs', function () {
    var eq1 = "y=3x+5";
    var eq2 = "y=3x+5.001";
    server.isEquationEqual(eq1, eq2, {sigfigs: 3}).should.eql(true);
    server.isEquationEqual(eq1, eq2, {sigfigs: 4}).should.eql(false);
  });
});
