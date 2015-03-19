var _ = require('lodash');
var fb = require('corespring.server-shared.server.feedback-utils');
var keys = fb.keys;

exports.keys = keys;

var pointEqual = function(p1, p2) {
  return Math.abs(p1-p2) < 0.01;
};

var elementEqual = function(e1, e2) {
  if (e1 == null && e2 == null) {
    return true;
  }
  if (e1 == null || e2 == null || e1.marked || e2.marked) {
    return false;
  }
  if (e1.type !== e2.type) {
    return false;
  }
  switch (e1.type) {
    case "point":
      return pointEqual(e1.domainPosition, e2.domainPosition) && e1.pointType === e2.pointType;
    case "line":
      return pointEqual(e1.domainPosition, e2.domainPosition) && pointEqual(e1.size, e2.size) && e1.leftPoint === e2.leftPoint && e1.rightPoint === e2.rightPoint;
    case "ray":
      return pointEqual(e1.domainPosition, e2.domainPosition) && e1.pointType === e2.pointType && e1.direction === e2.direction;
  }
  return false;
};

var isElementCorrect = function(element, correctAnswer) {
  var correctElement = _.find(correctAnswer, function(ce) {
    return elementEqual(element, ce);
  });
  if (correctElement) {
    correctElement.marked = true;
    return true;
  }
  return false;
};

var getElementsWithFeedback = function(answer, correctAnswer) {
  var answerWithFeedback = _.cloneDeep(answer);
  _.each(answerWithFeedback, function(el) {
    el.isCorrect = isElementCorrect(el, correctAnswer);
  });
  return answerWithFeedback;
};

var calculateScore = function(answer, question) {

  var countAnsweredCorrectly = function() {
    var correctResponse = _.cloneDeep(question.correctResponse);
    var sum = _.reduce(answer, function(sum, a) {
      var contains = isElementCorrect(a, correctResponse);
      var newsum = sum + (contains ? 1 : 0);
      return newsum;
    }, 0);
    return sum;
  };

  var calculatePartialScore = function(correctCount) {
    var partialScore = _.find(question.partialScoring, function(ps) {
      return ps.numberOfCorrect === correctCount;
    });

    return _.isUndefined(partialScore) ? 0 : partialScore.scorePercentage;
  };

  var definedAsCorrect = question.correctResponse.length;
  var answeredCorrectly = countAnsweredCorrectly();

  if (answeredCorrectly === 0) {
    return 0;
  }

  if (answeredCorrectly === definedAsCorrect) {
    return 1;
  }

  if (definedAsCorrect > 1 && question.allowPartialScoring) {
    return calculatePartialScore(answeredCorrectly) / 100;
  } else {
    return (answeredCorrectly === definedAsCorrect) ? 1 : 0;
  }
};


exports.isCorrect = function(answer, correctAnswer) {
  return answer.length === correctAnswer.length && _(answer).every(function(el) {
    return isElementCorrect(el, correctAnswer);
  });
};

exports.isPartiallyCorrect = function(answer, correctAnswer) {
  return _(answer).any(function(el) {
    return isElementCorrect(el, correctAnswer);
  });
};

exports.respond = function(question, answer, settings) {

  if (!answer) {
    return {
      correctness: 'incorrect'
    };
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }


  var isCorrect = exports.isCorrect(answer, _.cloneDeep(question.correctResponse));
  var isPartiallyCorrect = exports.isPartiallyCorrect(answer, _.cloneDeep(question.correctResponse));

  var response = {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    correctClass: fb.correctness(isCorrect, isPartiallyCorrect),
    score: calculateScore(answer, question)
  };

  if (settings.showFeedback) {
    response.feedback = {
      elements: getElementsWithFeedback(answer, _.cloneDeep(question.correctResponse)),
      message: fb.makeFeedback(undefined, fb.correctness(isCorrect, isPartiallyCorrect))
    };

  }

  return response;
};
