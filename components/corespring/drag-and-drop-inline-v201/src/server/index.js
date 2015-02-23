var _ = require('lodash');
var fb = require('corespring.server-shared.server.feedback-utils');

exports.keys = fb.keys;

exports.respond = function(question, answer, settings) {

  if(!question || _.isEmpty(question)){
    throw new Error('the question should never be null or empty');
  }

  var isEmptyAnswer = _.isEmpty(answer) || _.every(answer, function(a) {
      return _.isEmpty(a);
    });

  if (isEmptyAnswer) {
    return {
      correctness: 'warning',
      correctResponse: question.correctResponse,
      answer: answer,
      score: 0,
      correctClass: 'warning',
      feedback: settings.showFeedback ? fb.makeFeedback(question.feedback, 'warning') : null
    };
  }

  var isCorrect = true;
  var isPartiallyCorrect = false;
  var numberOfCorrectAnswers = 0;

  function countCorrectAnswers(correctResponses, answers){
    var count = 0;
    var maxLength = Math.min(correctResponses.length, answers.length);
    for(var i = 0; i < maxLength; i++){
      if(correctResponses[i] === answers[i]){
        count++;
      }
    }
    return count;
  }

  for (var k in answer) {
    var correctResponsesForId = question.correctResponse[k];
    if (correctResponsesForId && answer[k]) {
      var correctAnswersCount = countCorrectAnswers(correctResponsesForId, answer[k]);
      var hasSuperfluousAnswers = answer[k].length > correctResponsesForId.length;
      isCorrect &= correctAnswersCount === correctResponsesForId.length && !hasSuperfluousAnswers;
      isPartiallyCorrect |= correctAnswersCount > 0 && (correctAnswersCount < correctResponsesForId.length || hasSuperfluousAnswers );
      numberOfCorrectAnswers += correctAnswersCount;
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
    res.feedback = fb.makeFeedback(question.feedback, fb.correctness(isCorrect, isPartiallyCorrect));
  }

  return res;
};


