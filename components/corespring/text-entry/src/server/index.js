var _ = require('lodash');


exports.isEqual = function(s1, s2, ignoreCase, ignoreWhitespace) {
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

exports.isCorrect = function(answer, responses) {
  var ignoreCase = (responses.ignoreCase) || false;
  var ignoreWhitespace = (responses.ignoreWhitespace) || false;

  return _.some(responses.values, function(a) {
    return exports.isEqual(answer, a, ignoreCase, ignoreWhitespace);
  });
};

exports.respond = function(question, answer, settings) {
  var response;

  function createResponse(correctness, score, comments) {
    return {
      correctness: correctness,
      score: score / 100,
      feedback: {},
      comments: comments
    };
  }

  function isCorrectResponse(response) {
    return response && response.score === 1;
  }

  function isIncorrectResponse(response) {
    return response && response.score === 0;
  }

  function isPartialResponse(response) {
    return response && response.score >= 0 && response.score <= 1;
  }

  function getFeedbackType(response) {
    return isCorrectResponse(response) ? "correct" : (isIncorrectResponse(response) ? "incorrect" : "partial");
  }

  function getFeedbackTemplate(question, response) {
    var feedbackTemplate = "";
    if (isCorrectResponse(response)) {
      feedbackTemplate = question.correctResponses.feedback.value;
    } else if (isPartialResponse(response)) {
      feedbackTemplate = question.partialResponses.feedback.value;
    } else if (isIncorrectResponse(response.correctness)) {
      feedbackTemplate = question.incorrectResponses.feedback.value;
    }
    return feedbackTemplate;
  }

  function createFeedbackMessage(question, response) {
    var feedbackTemplate = getFeedbackTemplate(question, response);
    var result = replaceVariables(feedbackTemplate, question);
    return result;
  }

  function replaceVariables(template, question) {
    return template.replace("<random selection from correct answers>", randomCorrectAnswer(question));
  }

  function randomCorrectAnswer(question) {
    var result = _.sample(question.correctResponses.values);
    return result;
  }

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  if (exports.isCorrect(answer, question.correctResponses)) {
    response = createResponse("correct", 100, question.comments);
  } else if (exports.isCorrect(answer, question.partialResponses)) {
    response = createResponse("incorrect", question.partialResponses.award, question.comments);
  } else {
    response = createResponse("incorrect", 0, question.comments);
  }

  if (settings.showFeedback) {
    response.feedback = {
      correctness: getFeedbackType(response),
      message: createFeedbackMessage(question, response)
    };
  }

  console.log("text-entry.respond" + response);
  return response;
};