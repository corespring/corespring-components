var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");
var fb = require('corespring.server-shared.server.feedback-utils');

var DEFAULT_INCORRECT_FEEDBACK = "Good try!";
exports.keys = _.cloneDeep(fb.keys);
exports.keys.DEFAULT_INCORRECT_FEEDBACK = DEFAULT_INCORRECT_FEEDBACK;

exports.isCorrect = function(answer, correctEquation, options) {
  return functionUtils.isEquationCorrect(correctEquation, answer, options);
};

exports.respond = function(question, answer, settings) {

  if(!question || _.isEmpty(question)){
    throw new Error('question should never be empty or null');
  }

  if(!answer){
    return {
      correctness: 'warning',
      score: 0,
      feedback: settings.showFeedback ? fb.makeFeedback(question.feedback, 'warning') : null,
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
    var defaults = _.extend(fb.defaults, {incorrect: DEFAULT_INCORRECT_FEEDBACK});
    response.feedback = fb.makeFeedback(question.feedback, response.correctness, defaults);
    response.comments = question.comments;
  }

  return response;
};
