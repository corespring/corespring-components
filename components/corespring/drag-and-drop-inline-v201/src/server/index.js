var _ = require('lodash');
var fb = require('corespring.server-shared.server.feedback-utils');

exports.keys = fb.keys;

exports.respond = function (question, answer, settings) {

  if (!question || _.isEmpty(question)) {
    throw new Error('the question should never be null or empty');
  }

  var isEmptyAnswer = _.isEmpty(answer) || _.every(answer, function (a) {
      return _.isEmpty(a);
    });

  function addOptionalParts(feedbackType, value) {
    if (settings.showFeedback) {
      value.feedback = fb.makeFeedback(question.feedback, feedbackType);
    }
    if(question.comments){
      value.comments = question.comments;
    }
    return value;
  }

  if (isEmptyAnswer) {
    return addOptionalParts("warning", {
      correctness: 'incorrect',
      correctResponse: question.correctResponse,
      answer: answer,
      score: 0,
      correctClass: 'warning'
    });
  }

  function countCorrectAnswers(correctResponses, answers) {
    var count = 0;
    var copyOfAnswers = answers.slice();
    _.each(correctResponses, function (correctId) {
      var index = _.indexOf(copyOfAnswers, correctId);
      if (index >= 0) {
        count++;
        copyOfAnswers.splice(index, 1);
      }
    });
    return count;
  }

  var expectedNumberOfCorrectAnswers = 0;
  var numberOfCorrectAnswers = 0;
  var numberOfAnswers = 0;
  for (var k in question.correctResponse) {
    var correctResponsesForId = question.correctResponse[k];
    if (_.isArray(correctResponsesForId)) {
      expectedNumberOfCorrectAnswers += correctResponsesForId.length;
    }
    var answersForId = answer[k];
    if (_.isArray(answersForId)) {
      numberOfAnswers += answersForId.length;
    }
    if (_.isArray(correctResponsesForId) && _.isArray(answersForId)) {
      var correctAnswersCount = countCorrectAnswers(correctResponsesForId, answersForId);
      numberOfCorrectAnswers += correctAnswersCount;
    }
  }

  var isCorrect = numberOfCorrectAnswers === expectedNumberOfCorrectAnswers &&
    numberOfCorrectAnswers === numberOfAnswers;
  var isPartiallyCorrect = !isCorrect && numberOfCorrectAnswers > 0;

  var score = 0;

  if (isCorrect) {
    score = 1;
  } else if (question.allowPartialScoring) {
    var partialScore = _.find(question.partialScoring, function (ps) {
      return ps.numberOfCorrect === numberOfCorrectAnswers;
    });
    if (partialScore) {
      score = partialScore.scorePercentage / 100;
    }
  }

  return addOptionalParts(fb.correctness(isCorrect, isPartiallyCorrect), {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    answer: answer,
    score: score,
    correctClass: fb.correctness(isCorrect, isPartiallyCorrect)
  });
};


