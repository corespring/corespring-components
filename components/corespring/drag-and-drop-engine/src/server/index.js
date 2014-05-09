exports.createResponse = function(question, answer, settings, defaults) {

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
    score: score
  };

  if (settings.showFeedback) {
    var fbSelector = isCorrect ? "correctFeedback" : (isPartiallyCorrect ? "partialFeedback" : "incorrectFeedback");
    var fbTypeSelector = fbSelector + "Type";

    var feedbackType = question.feedback[fbTypeSelector] || "default";
    if (feedbackType === "custom") {
      res.feedback = question.feedback[fbSelector];
    } else if (feedbackType === "default") {
      res.feedback = isCorrect ? defaults.correct : (isPartiallyCorrect ? defaults.partial : defaults.incorrect);
    }
  }

  return res;
};
