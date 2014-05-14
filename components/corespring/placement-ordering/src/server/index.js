var _ = require('lodash');
var dragAndDropEngine = require("corespring.drag-and-drop-engine.server");


exports.DEFAULT_CORRECT_FEEDBACK = "Correct!";
exports.DEFAULT_PARTIAL_FEEDBACK = "Almost!";
exports.DEFAULT_INCORRECT_FEEDBACK = "Good try but that is not the correct answer.";

exports.respond = function(question, answer, settings) {

  var defaults = {
    correct: exports.DEFAULT_CORRECT_FEEDBACK,
    incorrect: exports.DEFAULT_INCORRECT_FEEDBACK,
    partial: exports.DEFAULT_PARTIAL_FEEDBACK
  };



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
