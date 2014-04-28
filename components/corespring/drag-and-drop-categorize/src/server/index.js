var _ = require('lodash');

exports.DEFAULT_CORRECT_FEEDBACK = "Correct!";
exports.DEFAULT_PARTIAL_FEEDBACK = "Partially Correct!";
exports.DEFAULT_INCORRECT_FEEDBACK = "Good try but that is not the correct answer.";

exports.respond = function(question, answer, settings) {

  var isCorrect = true;
  var isPartiallyCorrect = false;

  for (var k in answer) {
    var correctResponseForId = question.correctResponse[k];
    isCorrect &= _.isEmpty(_.xor(answer[k], correctResponseForId));
    isPartiallyCorrect |= _.xor(answer[k], correctResponseForId).length < (answer[k].length + correctResponseForId.length);
  }

  var res = {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    answer: answer,
    score: isCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    var fbSelector = isCorrect ? "correctFeedback" : (isPartiallyCorrect ? "partialFeedback" : "incorrectFeedback");
    var fbTypeSelector = fbSelector + "Type";

    var feedbackType = question.feedback[fbTypeSelector] || "default";
    if (feedbackType === "custom") {
      res.feedback = question.feedback[fbSelector];
    } else if (feedbackType === "default") {
      res.feedback = isCorrect ? exports.DEFAULT_CORRECT_FEEDBACK : (isPartiallyCorrect ? exports.DEFAULT_PARTIAL_FEEDBACK : exports.DEFAULT_INCORRECT_FEEDBACK);
    }
  }


  return res;
};
