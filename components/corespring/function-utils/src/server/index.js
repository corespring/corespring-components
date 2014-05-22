var _ = require('lodash');
var mathjs = require('mathjs')();

var trimSpaces = function(s) {
  return s.replace(/\s+/g, "");
};

var replaceVar = function(expression, variable) {
  var m;

  var patternMatch = function(pattern) {
    return pattern.exec(expression);
  };

  m = patternMatch(new RegExp(".*?([0-9)])" + variable + "([(0-9]).*"));
  if (m) {
    return replaceVar(expression.replace(new RegExp("[0-9)]" + variable + "[(0-9]"), m[1] + "*(x)*" + m[2]), variable);
  }

  m = patternMatch(new RegExp(".*?([0-9)])" + variable + ".*"));
  if (m) {
    return replaceVar(expression.replace(new RegExp("[0-9)]" + variable), m[1] + "*(x)"), variable);
  }

  m = patternMatch(new RegExp(".*?" + variable + "([(0-9]).*"));
  if (m) {
    return replaceVar(expression.replace(variable + "[(0-9]", "(x)*" + m[2]), variable);
  }

  return expression;
};

exports.expressionize = function(eq, varname, ignoreSpacing) {
  if (_.isUndefined(ignoreSpacing) || ignoreSpacing === true) {
    eq = trimSpaces(eq);
  }
  eq = replaceVar(eq, varname);
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

  var eq1r = exports.expressionize(eq1, variable, options.ignoreSpacing);
  var eq2r = exports.expressionize(eq2, variable, options.ignoreSpacing);

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
    }
    return false;
  });

  return _.isUndefined(notMatching);
};
