var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");

exports.isCorrect = function (answer, correctEquation) {
  var correctFunction = correctEquation.split("=")[1];
  if (answer.indexOf('=') >= 0)
    answer = answer.split("=")[1];
  return functionUtils.isFunctionEqual(answer, correctFunction);
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
  }

  return response;
};
