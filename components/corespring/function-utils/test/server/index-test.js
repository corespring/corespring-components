var server = require('../../src/server');
var assert = require('assert');
var should = require('should');
var _ = require('lodash');


describe('expressionize', function () {
  it('trims spaces', function () {
    var eq = "  12x +   3   ";
    var result = server.expressionize(eq, 'x');
    result.should.eql("12*(x)+3");
  });

  it('inserts * where adequate in a simple expression', function () {
    var eq = "12x+3";
    var result = server.expressionize(eq, 'x');
    result.should.eql("12*(x)+3");
  });

  it('inserts * where adequate in a complex expression', function () {
    var eq = "(10-5)x+(32/4)";
    var result = server.expressionize(eq, 'x');
    result.should.eql("(10-5)*(x)+(32/4)");
  });
});

describe('linear function equal logic', function () {

  it('identical functions are equal', function () {
    var eq1 = "3x+5";
    var eq2 = "3x+5";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same slope (fraction)', function () {
    var eq1 = "3x+5";
    var eq2 = "(6/2)x+5";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same slope (multiplication)', function () {
    var eq1 = "3x+5";
    var eq2 = "1.5*2x+5";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same slope (complex expression)', function () {
    var eq1 = "3x+5";
    var eq2 = "(15-5-7)x+5";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same y-intercept (fraction)', function () {
    var eq1 = "3x+5";
    var eq2 = "3x+(10/2)";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same y-intercept (multiplication)', function () {
    var eq1 = "3x+5";
    var eq2 = "3x+2.5*2";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('same y-intercept (complex expression)', function () {
    var eq1 = "3x+5";
    var eq2 = "3x+(2+12/4)";
    server.isFunctionEqual(eq1, eq2).should.eql(true);
  });

  it('different variable name than x', function () {
    var eq1 = "3g+5";
    var eq2 = "3g+(2+12/4)";
    server.isFunctionEqual(eq1, eq2, {variable: 'g'}).should.eql(true);
  });

  it('precision is up to 10^-sigfigs', function () {
    var eq1 = "3x+5";
    var eq2 = "3x+5.001";
    server.isFunctionEqual(eq1, eq2, {sigfigs: 3}).should.eql(true);
    server.isFunctionEqual(eq1, eq2, {sigfigs: 4}).should.eql(false);
  });
});
