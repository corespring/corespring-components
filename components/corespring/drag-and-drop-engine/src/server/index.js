var _ = require('lodash');
var fb = require('corespring.server-shared.server.feedback-utils');

exports.createResponse = function(question, answer, settings) {

  if(!question || _.isEmpty(question)){
    throw new Error('the question should never be null or empty');
  }

  if(!answer){
    return {
      correctness: 'incorrect',
      score: 0,
      correctResponse: question.correctResponse,
      answer: answer,
      feedback: settings.showFeedback ? fb.makeFeedback(question.feedback, 'incorrect') : null
    };
  }

  var isCorrect = true;
  var isPartiallyCorrect = false;
  var numberOfCorrectAnswers = 0;

  for (var k in answer) {
    var correctResponseForId = question.correctResponse[k];
    if (correctResponseForId && answer[k]) {
      isCorrect &= _.isEmpty(_.xor(answer[k], correctResponseForId));
      isPartiallyCorrect |= _.xor(answer[k], correctResponseForId).length < (answer[k].length + correctResponseForId.length);
      numberOfCorrectAnswers += correctResponseForId.length - _.xor(answer[k], correctResponseForId).length;
    }
  }

  var score = 0;

  if (isCorrect) {
    score = 1;
  } else if (question.allowPartialScoring) {
    var partialScore = _.find(question.partialScoring, function(ps) {
      return ps.numberOfCorrect === numberOfCorrectAnswers;
    });
    if (partialScore) {
      score = partialScore.scorePercentage / 100;
    }
  }

  var res = {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    answer: answer,
    score: score,
    correctClass: fb.correctness(isCorrect, isPartiallyCorrect),
    comments: question.comments
  };

  if (settings.showFeedback) {
    res.feedback = fb.makeFeedback(question, fb.correctness(isCorrect, isPartiallyCorrect));
  }

  return res;
};
