var _ = require('lodash');

var fbu = require('corespring.server-shared.server.feedback-utils');
var keys = fbu.keys;

exports.keys = keys;

exports.isCorrect = function(answer, correctResponse, orderMatters) {
  if (orderMatters) {
    return _.isEqual(answer, correctResponse);
  } else {
    return _.isEqual(answer.sort(), correctResponse.sort());
  }
};

exports.createOutcome = function(question, answer, settings) {
  var correctResponse = question.correctResponse;


  if(!answer){
    return {
      correctness: 'warning',
      score: 0, 
      feedback: settings.showFeedback ? fbu.makeFeedback(question.feedback, 'warning') : null,
      outcome: settings.showFeedback ? 'warning' : null
    };
  }

  var orderMatters = (question.model.config.labelsType === 'present' && !!question.model.config.orderMatters);

  var isCorrect = exports.isCorrect(answer, correctResponse, orderMatters);

  var res = {
    correctness: isCorrect ? "correct" : "incorrect",
    score: isCorrect ? 1 : 0,
    correctResponse: correctResponse,
    comments: question.comments
  };

  if (settings.showFeedback) {
    res.outcome = [isCorrect ? "correct" : "incorrect"];
    res.feedback = fbu.makeFeedback(question.feedback, res.outcome);
  }

  return res;
};
