var _ = require('lodash');
var dragAndDropEngine = require('corespring.drag-and-drop-engine.server');

var keys = require('corespring.server-shared.server').keys;
var fb = require('corespring.server-shared.feedback-utils');

exports.respond = function(question, answer, settings) {


  if(!question || _.isEmpty(question)){
    throw new Error('question should never be null or empty');
  }

  if (!answer) {
    return {
      correctness: 'incorrect',
      correctResponse: question.correctResponse,
      answer: answer,
      score: 0,
      correctClass: 'incorrect',
      feedback: settings.showFeedback ? fb.makeFeedback(question.feedback, 'incorrect') : null
    };
  }

  var numberOfCorrectAnswers = 0;

  for (var idx = 0; idx < Math.min(answer.length, question.correctResponse.length); idx++) {
    if (answer[idx] === question.correctResponse[idx]) {
      numberOfCorrectAnswers++;
    }
  }
  var isCorrect = numberOfCorrectAnswers === question.correctResponse.length;
  var isPartiallyCorrect = numberOfCorrectAnswers > 0;

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
    correctness: isCorrect ? 'correct' : 'incorrect',
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