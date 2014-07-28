var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");

exports.render = function(item) {
  if (_.isString(item.model.config.initialValues)) {
    item.initialCurve = functionUtils.expressionize(item.model.config.initialValues, 'x');
  }
  return item;
};

function getFeedback(question, answer, settings, isCorrect){
  var fbSelector = isCorrect ? 'correctFeedback' : 'incorrectFeedback';
  var fbTypeSelector = isCorrect ? 'correctFeedbackType' : 'incorrectFeedbackType';

  var feedbackType = question.feedback[fbTypeSelector] || 'default';

  if (feedbackType === 'custom') {
    return question.feedback[fbSelector];
  } else if (feedbackType === 'default') {
    return isCorrect ? 'Correct!' : 'Good try but that is not the correct answer.';
  }
}

exports.respond = function(question, answer, settings) {

  var addFeedback = (settings.showFeedback && question.model && question.model.config && !question.model.config.exhibitOnly);

  if(!answer){
    return {
      correctness: 'incorrect',
      score: 0,
      feedback: addFeedback ? getFeedback(question, answer, settings, false) : null
    };
  }

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

  if (addFeedback) {
    res.feedback = getFeedback(question, answer, settings, isCorrect);
  }

  return res;

};
