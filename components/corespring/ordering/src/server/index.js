var _ = require('lodash');
var dragAndDropEngine = require('corespring.drag-and-drop-engine.server');

var fb = require('corespring.server-shared.server.feedback-utils');
var keys = fb.keys;

exports.keys = keys;

exports.createOutcome = function(question, answer, settings) {


  if(!question || _.isEmpty(question)){
    throw new Error('question should never be null or empty');
  }

  var correctResponse = _.isEmpty(question.correctResponse) ? _.pluck(question.model.choices, 'id') : question.correctResponse;

  var isEmptyAnswer = _.isEmpty(answer) || _.every(answer, function(a) {
    return _.isEmpty(a);
  });
  if (isEmptyAnswer) {
    return {
      correctness: 'warning',
      correctResponse: correctResponse,
      answer: answer,
      score: 0,
      correctClass: 'warning',
      feedback: settings.showFeedback ? fb.makeFeedback(question.feedback, 'warning') : null
    };
  }

  var numberOfCorrectAnswers = 0;

  for (var idx = 0; idx < Math.min(answer.length, correctResponse.length); idx++) {
    if (answer[idx] === correctResponse[idx]) {
      numberOfCorrectAnswers++;
    }
  }
  var isCorrect = numberOfCorrectAnswers === correctResponse.length;
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
    correctResponse: correctResponse,
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