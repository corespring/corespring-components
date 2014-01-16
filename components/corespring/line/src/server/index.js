var _ = require('lodash');
var equationUtils = require("corespring.equation-utils.server");

exports.respond = function (question, answer, settings) {
  console.log("CR: " + JSON.stringify(question.correctResponse));
  console.log("A: " + JSON.stringify(answer));

  var slope = (answer.B.y - answer.A.y) / (answer.B.x - answer.A.x);
  var yintercept = answer.A.y - (slope * answer.A.x);
  var eq = "y=" + slope + "x+" + yintercept;

  var options = {};
  options.variable = (question.correctResponse.vars && question.correctResponse.vars.split(",")[0]) || 'x';
  options.sigfigs = question.correctResponse.sigfigs || 3;

  var correctResponse = question.correctResponse;
  var isCorrect = equationUtils.isEquationEqual(eq, correctResponse.equation, options);

  return {
    "correctness": isCorrect ? "correct" : "incorrect",
    "score": isCorrect ? 1 : 0,
    "correctResponse": correctResponse
  };
};
