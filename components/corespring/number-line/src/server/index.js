var _ = require('lodash');
var fb = require('corespring.server-shared.server.feedback-utils');
var keys = fb.keys;

exports.keys = keys;

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
      return e1.domainPosition === e2.domainPosition;
    case "line":
      return e1.domainPosition === e2.domainPosition && e1.size === e2.size && e1.leftPoint === e2.leftPoint && e1.rightPoint === e2.rightPoint;
    case "ray":
      return e1.domainPosition === e2.domainPosition && e1.pointType === e2.pointType && e1.direction === e2.direction;
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

exports.isCorrect = function(answer, correctAnswer) {
  return answer.length === correctAnswer.length && _(answer).every(function(el) {
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

  var response = {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    score: isCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    response.feedback = {
      elements: getElementsWithFeedback(answer, _.cloneDeep(question.correctResponse)),
      message: fb.makeFeedback(undefined, fb.correctness(isCorrect))
    };

  }

  return response;
};
