var _ = require('lodash');

function getFeedback(question, defaults, isCorrect, isPartiallyCorrect){
  var fbSelector = isCorrect ? "correctFeedback" : (isPartiallyCorrect ? "partialFeedback" : "incorrectFeedback");
  var fbTypeSelector = fbSelector + "Type";

  var feedbackType = question.feedback[fbTypeSelector] || "default";

  if (feedbackType === "custom") {
    return question.feedback[fbSelector];
  } else if (feedbackType === "default") {
    return isCorrect ? defaults.correct : (isPartiallyCorrect ? defaults.partial : defaults.incorrect);
  }
}

exports.createResponse = function(question, answer, settings, defaults) {

  if(!question || _.isEmpty(question)){
    throw new Error('the question should never be null or empty');
  }

  if(!answer){
    return {
      correctness: 'incorrect',
      score: 0,
      correctResponse: question.correctResponse,
      answer: answer,
      feedback: settings.showFeedback ? getFeedback(question, defaults, false, false) : null
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
    correctClass: isCorrect ? 'correct' : (isPartiallyCorrect ? 'partial' : 'incorrect')
  };

  if (settings.showFeedback) {
    res.feedback = getFeedback(question, defaults, isCorrect, isPartiallyCorrect);
  }

  return res;
};
