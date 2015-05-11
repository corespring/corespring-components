var _ = require('lodash');
var fb = require('corespring.server-shared.server.feedback-utils');

exports.keys = fb.keys;

exports.createOutcome = function (question, answer, settings) {

  if (!question || _.isEmpty(question)) {
    throw new Error('the question should never be null or empty');
  }

  var isEmptyAnswer = _.isEmpty(answer) || _.every(answer, function (a) {
      return _.isEmpty(a);
    });

  if (isEmptyAnswer) {
    return addOptionalParts("warning", {
      correctness: 'incorrect',
      answer: answer,
      score: 0,
      correctClass: 'warning',
      feedbackPerChoice: {}
    });
  }

  var feedbackPerChoice = {};
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
      var results = evaluateChoices(correctResponsesForId, answersForId);
      numberOfCorrectAnswers += results.correctAnswersCount;
      feedbackPerChoice[k] = results.feedback;
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
    feedbackPerChoice: feedbackPerChoice,
    score: score,
    correctClass: fb.correctness(isCorrect, isPartiallyCorrect)
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

  function evaluateChoices(correctResponses, answers){
    var feedback = [];
    var countCorrect = 0;
    var copyOfResponses = correctResponses.slice();
    _.each(answers, function (answerId) {
      var index = _.indexOf(copyOfResponses, answerId);
      if (index >= 0) {
        countCorrect++;
        feedback.push('correct');
        copyOfResponses.splice(index, 1);
      } else {
        feedback.push('incorrect');
      }
    });
    return {correctAnswersCount: countCorrect, feedback: feedback};
  }

};


