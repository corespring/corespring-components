var _ = require('lodash');

exports.render = function (element) {
  delete element.points;
  delete element.correctResponse;
  delete element.feedback;
  return element;
};

exports.isCorrect = function (answer, correctAnswer) {
  if (_.isArray(correctAnswer))
    return _.contains(correctAnswer, answer);
  else
    return answer == correctAnswer;
};


exports.respond = function (question, answer, settings) {
  var answerIsCorrect, response;

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  answerIsCorrect = this.isCorrect(answer, question.correctResponse);

  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: answerIsCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    response.feedback = "boo";
  }

  return response;
};
