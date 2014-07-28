var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");

exports.DEFAULT_CORRECT_FEEDBACK = "Correct!";
exports.DEFAULT_INCORRECT_FEEDBACK = "Good try but that is not the correct answer.";

exports.isCorrect = function(answer, correctEquation, options) {
  var correctFunction = correctEquation;
  if (correctEquation.indexOf('=') >= 0) {
    correctFunction = correctEquation.split("=")[1];
  }
  if (answer.indexOf('=') >= 0) {
    answer = answer.split("=")[1];
  }
  return functionUtils.isFunctionEqual(answer, correctFunction, options);
};

function getFeedback(question, answerIsCorrect){
  var fbSelector = answerIsCorrect ? "correctFeedback" : "incorrectFeedback";
  var fbTypeSelector = fbSelector + "Type";

  var feedbackType = question.feedback[fbTypeSelector] || "default";
  if (feedbackType === "custom") {
    return  question.feedback[fbSelector];
  } else if (feedbackType === "default") {
    return answerIsCorrect ? exports.DEFAULT_CORRECT_FEEDBACK : exports.DEFAULT_INCORRECT_FEEDBACK;
  }
}

exports.respond = function(question, answer, settings) {

  if(!question || _.isEmpty(question)){
    throw new Error('question should never be undefined');
  }

  if(!answer){
    return {
      correctness: 'incorrect',
      score: 0,
      feedback: settings.showFeedback ? getFeedback(question, false) : null,
      outcome: settings.showFeedback ? ['incorrectEquation'] : [],
      comments: settings.showFeedback ? question.comments : null
    };
  }
  
  var answerIsCorrect, response;

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var correctResponse = _.isObject(question.correctResponse) ? question.correctResponse : {
    equation: question.correctResponse
  };

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
    if (!answerIsCorrect) {
      response.outcome.push("incorrectEquation");
    }
    if (!isCorrectForm) {
      response.outcome.push("lineEquationMatch");
    }
    response.feedback = getFeedback(question, answerIsCorrect);
    response.comments = question.comments;
  }

  return response;
};
