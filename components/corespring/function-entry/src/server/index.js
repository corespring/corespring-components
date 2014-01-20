var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");

exports.isCorrect = function (answer, correctEquation, options) {
  var correctFunction = correctEquation.split("=")[1];
  if (answer.indexOf('=') >= 0)
    answer = answer.split("=")[1];
  return functionUtils.isFunctionEqual(answer, correctFunction, options);
};

exports.respond = function (question, answer, settings) {

  var answerIsCorrect, response;

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var options = {};
  options.variable = (question.correctResponse.vars && question.correctResponse.vars.split(",")[0]) || 'x';
  options.sigfigs = question.correctResponse.sigfigs || 3;

  answerIsCorrect = this.isCorrect(answer, question.correctResponse.equation, options);

  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: answerIsCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
  }

  return response;
};
