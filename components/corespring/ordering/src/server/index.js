var _ = require('lodash');

exports.respond = function(question, answer, settings) {

  var buildFeedback = function() {
    var feedback = {};
    for (var i = 0; i < question.correctResponse.length; i++) {
      var isCorrect = answer.length >= i && question.correctResponse[i] === answer[i];
      console.log("IC: " + question.model.choices[i].value + "," + answer[i]);
      feedback[question.correctResponse[i]] = {
        correct: isCorrect
      };
    }
    return feedback;
  };

  var isCorrect = _.isEqual(question.correctResponse, answer);

  var response = {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    score: isCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    response.feedback = buildFeedback();
  }

  return response;
};
