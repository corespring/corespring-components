var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");
var fbu = require('corespring.server-shared.server.feedback-utils');

exports.render = function(item) {
  if (_.isString(item.model.config.initialValues)) {
    item.initialCurve = functionUtils.expressionize(item.model.config.initialValues, 'x');
  }
  return item;
};


/**
 * if exhibitOnly is true - this component shouldn't be scoreable.
 */
exports.isScoreable = function(question, answer, outcome) {

  if(!question || !question.model || !question.model.config){
    return true;
  }

  return !question.model.config.exhibitOnly;
};

exports.createOutcome = function(question, answer, settings) {

  function validAnswer(answer) {
    return (!_.isUndefined(answer) && !_.isNull(answer) && !_.isEmpty(answer));
  }

  if (!question || _.isEmpty(question)){
    throw new Error('question should never be empty or null');
  }

  if (question.model && question.model.config && question.model.config.exhibitOnly) {
    console.log('exhibit only don\'t process');
    return {
      correctness: 'n/a',
      score: 0
    };
  }

  var addFeedback = (settings.showFeedback && question.model && question.model.config && !question.model.config.exhibitOnly);

  if (!validAnswer(answer)) {
    var answerCorrectness = _.isUndefined(answer) || _.isEmpty(answer) ? 'warning' : 'incorrect';
    return {
      correctness: answerCorrectness,
      score: 0,
      feedback: addFeedback ? fbu.makeFeedback(question.feedback, answerCorrectness) : null
    };
  }

  var options = {};
  options.variable = (question.correctResponse.vars && question.correctResponse.vars.split(",")[0]) || 'x';
  options.sigfigs = question.correctResponse.sigfigs || 3;

  var correctResponse = question.correctResponse;
  var correctFunction = question.correctResponse.split("=")[1];
  var isCorrect = functionUtils.isFunctionEqual(answer, correctFunction, options);

  var res = {};

  if (!question.model.config.exhibitOnly) {
    res = {
      correctness: isCorrect ? "correct" : "incorrect",
      score: isCorrect ? 1 : 0,
      correctResponse: {
        equation: correctResponse,
        expression: functionUtils.expressionize(correctResponse, 'x')
      },
      comments: question.comments
    };
  }

  if (addFeedback) {
    res.outcome = [isCorrect ? "correct" : "incorrect"];
    res.feedback = fbu.makeFeedback(question.feedback, res.correctness);
  }

  return res;

};
