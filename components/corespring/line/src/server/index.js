var _ = require('lodash');

exports.respond = function (question, answer, settings) {
  var correctResponse = question.correctResponse;
  var isCorrect = _.isEqual(correctResponse, answer);
  return {
    "correctness": isCorrect ? "correct" : "incorrect",
    "score": isCorrect ? 1 : 0,
    "correctResponse": correctResponse
  };
};
