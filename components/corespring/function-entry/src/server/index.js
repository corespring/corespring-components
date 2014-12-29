var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");
var fb = require('corespring.server-shared.server.feedback-utils');

exports.keys = fb.keys;

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

exports.respond = function(question, answer, settings) {

  if(!question || _.isEmpty(question)){
    throw new Error('question should never be empty or null');
  }

  if(!answer){
    return {
      correctness: 'incorrect',
      score: 0,
      feedback: settings.showFeedback ? fb.makeFeedback(question.feedback, 'incorrect') : null,
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
    var defaults = _.extend(fb.defaults, {incorrect: "Good try!"});
    response.feedback = fb.makeFeedback(question.feedback, response.correctness, defaults);
    response.comments = question.comments;
  }

  return response;
};
