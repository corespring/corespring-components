var _ = require('lodash');

exports.isCorrect = function(answer, correctResponse, orderMatters) {
  if (orderMatters) {
    return _.isEqual(answer, correctResponse);
  } else {
    return _.isEqual(answer.sort(), correctResponse.sort());
  }
};

exports.respond = function(question, answer, settings) {
  var correctResponse = question.correctResponse;

  var orderMatters = (question.model.config.labelsType === 'present' && !!question.model.config.orderMatters);

  var isCorrect = exports.isCorrect(answer, correctResponse, orderMatters);

  var res = {
    "correctness": isCorrect ? "correct" : "incorrect",
    "score": isCorrect ? 1 : 0,
    "correctResponse": correctResponse
  };

  if (settings.showFeedback) {
    res.outcome = [];
    if (isCorrect) {
      res.outcome.push('correct');
    } else {
      res.outcome.push('incorrect');
    }

    var fbSelector = isCorrect ? "correctFeedback" : "incorrectFeedback";
    var fbTypeSelector = isCorrect ? "correctFeedbackType" : "incorrectFeedbackType";

    var feedbackType = question.feedback[fbTypeSelector] || "default";
    if (feedbackType === "custom") {
      res.feedback = question.feedback[fbSelector];
    } else if (feedbackType === "default") {
      res.feedback = isCorrect ? "Correct!" : "Good try but that is not the correct answer.";
    }

  }

  return res;
};
