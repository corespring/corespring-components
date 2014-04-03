var _ = require('lodash');


exports.isEqual = function (s1, s2, ignoreCase, ignoreWhitespace) {
  if (ignoreCase) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  }

  if (ignoreWhitespace) {
    s1 = s1.replace(/\s*/g, '');
    s2 = s2.replace(/\s*/g, '');
  }

  return s1 === s2;
};

exports.isCorrect = function (answer, responses) {
  var ignoreCase = (responses.ignoreCase) || false;
  var ignoreWhitespace = (responses.ignoreWhitespace) || false;

  return _.some(responses.values, function (a) {
    return exports.isEqual(answer, a, ignoreCase, ignoreWhitespace);
  });
};

exports.respond = function (question, answer, settings) {
  var response;

  function createResponse(correctness, score) {
    return {
      correctness: correctness,
      score: score,
      feedback: {}
    };
  }

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  if (exports.isCorrect(answer, question.correctResponse)) {
    response = createResponse("correct", 1);
  } else if (exports.isCorrect(answer, question.partialResponse)) {
    response = createResponse("correct", question.partialResponse.award / 100);
  } else {
    response = createResponse("incorrect", 0);
  }

  if (settings.showFeedback) {
    response.feedback = {
      correctness: response.correctness
    };
  }

  return response;
};
