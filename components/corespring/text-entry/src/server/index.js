var _ = require('lodash');


exports.isEqual = function(s1, s2, ignoreCase, ignoreWhitespace) {
  if (ignoreCase) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  }

  if (ignoreWhitespace) {
    s1 = s1.replace(/\s*/g,'');
    s2 = s2.replace(/\s*/g,'');
  }

  return s1 === s2;
};

exports.isCorrect = function(answer, correctAnswer, ignoreCase, ignoreWhitespace) {
  if (_.isArray(correctAnswer)) {
    return _.some(correctAnswer, function(a) {
      return exports.isEqual(a, answer, ignoreCase, ignoreWhitespace);
    });
  } else {
    return exports.isEqual(answer, correctAnswer, ignoreCase, ignoreWhitespace);
  }
};


exports.respond = function(question, answer, settings) {
  var answerIsCorrect, response;

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var ignoreCase = (question.model.config && question.model.config.ignoreCase) || false;
  var ignoreWhitespace = (question.model.config && question.model.config.ignoreCase) || false;

  answerIsCorrect = this.isCorrect(answer, question.correctResponse, ignoreCase, ignoreWhitespace);

  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: answerIsCorrect ? 1 : 0,
    feedback: {}
  };

  if (settings.showFeedback) {
    response.feedback = {
      correctness: response.correctness
    };
  }

  return response;
};
