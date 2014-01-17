var _ = require('lodash');
var equationUtils = require("corespring.equation-utils.server");

exports.isCorrect = function (answer, correctAnswer) {
  return equationUtils.isEquationEqual(answer, correctAnswer);
};

exports.respond = function (question, answer, settings) {
  var answerIsCorrect, response;

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  answerIsCorrect = this.isCorrect(answer, question.correctResponse.equation);

  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: answerIsCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    response.feedback = "boo";
  }

  return response;
};
