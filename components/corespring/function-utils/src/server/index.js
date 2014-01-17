var _ = require('lodash');
var mathjs = require('mathjs');

var trimSpaces = function(s) {
  return s.replace(/\s+/g,"");
};

var replaceVar = function (expression, variable) {
  var m;

  var patternMatch = function (pattern) {
    return pattern.exec(expression);
  };

  if (m = patternMatch(new RegExp(".*?([0-9)])" + variable + "([(0-9]).*"))) {
    return replaceVar(expression.replace(new RegExp("[0-9)]" + variable + "[(0-9]"), m[1] + "*(x)*" + m[2]), variable);
  } else if (m = patternMatch(new RegExp(".*?([0-9)])" + variable + ".*"))) {
    return replaceVar(expression.replace(new RegExp("[0-9)]" + variable), m[1] + "*(x)"), variable)
  } else if (m = patternMatch(new RegExp(".*?" + variable + "([(0-9]).*"))) {
    return replaceVar(expression.replace(variable + "[(0-9]", "(x)*" + m[2]),variable)
  } else {
    return expression;
  }
};

exports.expressionize = function(eq, varname) {
  eq = trimSpaces(eq);
  eq = replaceVar(eq, varname);
  return eq;
};

exports.isFunctionEqual = function (eq1, eq2, options) {
  console.log("IsEqual: "+eq1+" with "+eq2);
  options = options || {};
  var variable = options.variable || 'x';
  var domain = options.domain || [-10,10];
  var sigfigs = options.sigfigs || 3;
  var numberOfTestPoints = options.numberOfTestPoints || 50;

  var eq1r = exports.expressionize(eq1, variable);
  var eq2r = exports.expressionize(eq2, variable);

  var round = function(num) {
    var multiplier = Math.pow(10, sigfigs);
    return Math.floor(num * multiplier) / multiplier;
  };

  var limit = Math.pow(10, 0-sigfigs);
  var step = (domain[1] - domain[0]) / numberOfTestPoints;

  var x = domain[0];
  while (x < domain[1]) {
    var y1 = eval(eq1r);
    var y2 = eval(eq2r);

    if (round(Math.abs(y1-y2)) > limit) return false;

    x += step;
  }

  return true;
};
