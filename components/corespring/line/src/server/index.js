var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");

exports.render = function(item) {
  if (_.isString(item.model.config.initialValues)) {
    item.initialCurve = functionUtils.expressionize(item.model.config.initialValues, 'x');
  }
  return item;
};

exports.respond = function(question, answer, settings) {

  var slope = (answer.B.y - answer.A.y) / (answer.B.x - answer.A.x);
  var yintercept = answer.A.y - (slope * answer.A.x);
  var eq = slope + "x+" + yintercept;

  var options = {};
  options.variable = (question.correctResponse.vars && question.correctResponse.vars.split(",")[0]) || 'x';
  options.sigfigs = question.correctResponse.sigfigs || 3;

  var correctResponse = question.correctResponse;
  var correctFunction = question.correctResponse.split("=")[1];
  var isCorrect = functionUtils.isFunctionEqual(eq, correctFunction, options);

  var res = {};

  if (!question.model.config.exhibitOnly) {
    res = {
      "correctness": isCorrect ? "correct" : "incorrect",
      "score": isCorrect ? 1 : 0,
      "correctResponse": {
        "equation": correctResponse,
        "expression": functionUtils.expressionize(correctResponse, 'x')
      }
    };
  }

  if (settings.showFeedback && !question.model.config.exhibitOnly) {
    var fbTypeSelector = isCorrect ? "correctFeedbackType" : "incorrectFeedbackType";
    if (question.feedback && question.feedback[fbTypeSelector] === 'custom') {
      var fbSelector = isCorrect ? "correctFeedback" : "incorrectFeedback";
      res.feedback = question.feedback[fbSelector];
    } else {
      res.feedback = isCorrect ? "Correct!" : "Good try but that is not the correct answer.";
    }
  }

  return res;

};
