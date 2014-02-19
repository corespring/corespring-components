var _ = require('lodash');

exports.respond = function (question, answer, settings) {
  var correctResponse = question.correctResponse;
  var isCorrect = _.isEqual(correctResponse, answer);
  var res = {
    "correctness": isCorrect ? "correct" : "incorrect",
    "score": isCorrect ? 1 : 0,
    "correctResponse": correctResponse
  };

  if (settings.showFeedback) {
    res.outcome = [];
    if (isCorrect) {res.outcome.push('correct');} else {res.outcome.push('incorrect');}
  }

  return res;
};
