var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");

exports.isCorrect = function (answer, correctEquation, options) {
  var correctFunction = correctEquation.split("=")[1];
  if (answer.indexOf('=') >= 0) {
    answer = answer.split("=")[1];
  }
  return functionUtils.isFunctionEqual(answer, correctFunction, options);
};

exports.respond = function (question, answer, settings) {

  var answerIsCorrect, response;

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var correctResponse = _.isObject(question.correctResponse) ? question.correctResponse : {equation: question.correctResponse};

  var options = {};
  options.variable = (correctResponse.vars && correctResponse.vars.split(",")[0]) || 'x';
  options.sigfigs = correctResponse.sigfigs || 3;

  var isCorrectForm = !_.isUndefined(answer.match(/y\s*=/));
  answerIsCorrect = exports.isCorrect(answer, correctResponse.equation, options);

  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: answerIsCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    response.outcome = [];
    if (!answerIsCorrect) response.outcome.push("incorrectEquation");
    if (!isCorrectForm) response.outcome.push("lineEquationMatch");
  }

  return response;
};
