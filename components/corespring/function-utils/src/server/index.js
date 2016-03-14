/* jslint evil: true */

var _ = require('lodash');
var mathjs = require('mathjs')();

function trimSpaces(s) {
  return s.replace(/\s+/g, "");
}

function replaceVarWithX(expression, variable) {
  return expression.replace(new RegExp(variable, "g"), "(x)");
}

function makeMultiplicationExplicit(eq) {
  return eq
    .replace(/([0-9)])\(/g, "$1*(")
    .replace(/\)([0-9(])/g, ")*$1");
}

exports.expressionize = function(eq, varname) {
  eq = eq || '';
  eq = trimSpaces(eq);
  eq = replaceVarWithX(eq, varname);
  eq = makeMultiplicationExplicit(eq);
  return eq;
};

var round = function(sigfigs) {
  return function(num) {
    var multiplier = Math.pow(10, sigfigs);
    return Math.floor(num * multiplier) / multiplier;
  };
};

var closeEnough = function(sigfigs) {
  return function(a, b) {
    var limit = Math.pow(10, 0 - sigfigs);
    return Math.abs(a - b) < limit;
  };
};

exports.generateRandomPointsForDomain = function(domain, numPoints, sigfigs) {
  var pointsPerSection = Math.ceil(numPoints / domain.include.length);
  var i = 0;
  var result = [];
  var excludedNumbers = _.map(domain.exclude, function(n) {
    return Number(n);
  });
  while (i < numPoints) {
    var sectionIndex = Math.floor(i / pointsPerSection);
    var section = domain.include[sectionIndex].split(",");
    var min = Number(section[0]);
    var max = Number(section[1]);
    var random = round(sigfigs)(Math.random() * (max - min) + min);
    if (!_.contains(excludedNumbers, random)) {
      i++;
      result.push(random);
    }
  }
  return result;
};

exports.isFunctionEqual = function(eq1, eq2, options) {
  options = options || {};
  var variable = options.variable || 'x';
  var domain = options.domain || {
    include: ["-10,10"]
  };
  var sigfigs = options.sigfigs || 3;
  var numberOfTestPoints = options.numberOfTestPoints || 50;

  var eq1r = exports.expressionize(eq1, variable);
  var eq2r = exports.expressionize(eq2, variable);

  var notMatching = _.find(exports.generateRandomPointsForDomain(domain, numberOfTestPoints, sigfigs), function(x) {
    try {
      var y1 = mathjs['eval'](eq1r, {
        x: x
      });
      var y2 = mathjs['eval'](eq2r, {
        x: x
      });
      if (!closeEnough(sigfigs)(y1, y2)) {
        return true;
      }
    } catch (e) {
      console.log('error: ' + e);
      // evaluation error in x
      return true;
    }
    return false;
  });

  return _.isUndefined(notMatching);
};

exports.isEquationCorrect = function(correctEquation, testEquation, options) {
  options = options || {};
  var variable = options.variable || 'x';
  var domain = options.domain || {
    include: ["-10,10"]
  };
  var sigfigs = options.sigfigs || 3;
  var numberOfTestPoints = options.numberOfTestPoints || 50;

  var expr1 = exports.expressionize(correctEquation, variable);
  if (/=/.test(expr1)) {
    expr1 = expr1.split("=")[1];
  }

  var expr2 = exports.expressionize(testEquation, variable);

  if (!/=/.test(expr2)) {
    expr2 = "y="+expr2;
  }
  var leftSideExpression = expr2.split("=")[0];
  var rightSideExpression = expr2.split("=")[1];

  if (/y/i.test(rightSideExpression)) {
    var tmp = leftSideExpression;
    leftSideExpression = rightSideExpression;
    rightSideExpression = tmp;
  }

  var notMatching = _.find(exports.generateRandomPointsForDomain(domain, numberOfTestPoints, sigfigs), function(x) {
    try {
      var correctY = mathjs['eval'](expr1, {x: x});
      var leftValue = mathjs['eval'](leftSideExpression, {x: x, y: 0});
      var rightValue = mathjs['eval'](rightSideExpression, {x: x, y: 0});
      var diff = rightValue - leftValue;

      if (!closeEnough(sigfigs)(diff, correctY)) {
        return true;
      }
    } catch (e) {
      console.log('error: ' + e);
      return true;
    }
    return false;
  });

  return _.isUndefined(notMatching);
};