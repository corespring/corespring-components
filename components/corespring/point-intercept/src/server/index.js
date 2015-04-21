var _ = require('lodash');

var fbu = require('corespring.server-shared.server.feedback-utils');
var keys = fbu.keys;

exports.keys = keys;

exports.isCorrect = function(answer, correctResponse, orderMatters) {

  return countAnsweredCorrectly(answer, correctResponse, orderMatters) === correctResponse.length;
};

var countAnsweredCorrectly = function(answer, correctResponse, orderMatters) {
  var sum = _.reduce(answer, function(sum, a, index) {
    var contains = orderMatters ? correctResponse[index] === a : _.contains(correctResponse, a);
    var newsum = sum + (contains ? 1 : 0);
    return newsum;
  }, 0);
  return sum;
};

var calculateScore = function(question, answer, correctResponse, orderMatters) {

  var calculatePartialScore = function(correctCount) {
    var partialScore = _.find(question.partialScoring, function(ps) {
      return ps.numberOfCorrect === correctCount;
    });

    return _.isUndefined(partialScore) ? 0 : partialScore.scorePercentage;
  };
  
  var definedAsCorrect = question.correctResponse.length;
  var answeredCorrectly = countAnsweredCorrectly(answer, correctResponse, orderMatters);

  if (answeredCorrectly === 0) {
    return 0;
  }

  if (answeredCorrectly === definedAsCorrect) {
    return 1;
  }
  
  if (definedAsCorrect > 1 && question.allowPartialScoring){
    return calculatePartialScore(answeredCorrectly) / 100;
  } else {
    return (answeredCorrectly === definedAsCorrect) ? 1 : 0;
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
  var numberOfCorrectAnswers = countAnsweredCorrectly(answer, correctResponse, orderMatters);
  var isPartiallyCorrect = numberOfCorrectAnswers > 0 && numberOfCorrectAnswers < correctResponse.length;
  
  var res = {
    correctness: isCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer, correctResponse, orderMatters),
    correctResponse: correctResponse,
    correctClass: fbu.correctness(isCorrect, (isPartiallyCorrect && question.allowPartialScoring)),
    comments: question.comments
  };

  if (settings.showFeedback) {
    res.outcome = [isCorrect ? "correct" : "incorrect"];
    res.feedback = fbu.makeFeedback(question.feedback, fbu.correctness(isCorrect, (isPartiallyCorrect && question.allowPartialScoring)));
  }

  return res;
};
