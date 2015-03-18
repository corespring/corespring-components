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
  var ignoreCase = (responses && responses.ignoreCase) || false;
  var ignoreWhitespace = (responses && responses.ignoreWhitespace) || false;
  var responseValues = responses ? ((responses.values instanceof Array) ? responses.values : [responses.values]) : [];

  return responses && _.some(responseValues, function(a) {
    return exports.isEqual(answer, a, ignoreCase, ignoreWhitespace);
  });
};

exports.createOutcome = function(question, answer, settings) {
  var response;

  if(!question || _.isEmpty(question)){
    throw new Error('question should never be empty or null');
  }

  if(!answer){
    return {
      correctness: 'warning',
      score: 0,
      feedback: settings.showFeedback ? {
        correctness: 'warning',
        message: "You did not enter a response."
      } : null
    };
  }

  function createResponse(correctness, score) {
    return {
      correctness: correctness,
      score: score / 100,
      feedback: {}
    };
  }

  function isCorrectResponse(response) {
    return response && response.score === 1;
  }

  function isIncorrectResponse(response) {
    return response && response.score === 0;
  }

  function isPartialResponse(response) {
    return response && !(isCorrectResponse(response) || isIncorrectResponse(response));
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
    } else {
      feedbackTemplate = question.incorrectResponses.feedback.value;
    }
    return feedbackTemplate;
  }

  function createFeedbackMessage(question, response, answer) {
    var feedbackTypeResponses = getFeedbackType(response)+"Responses";
    var specificFeedback = question[feedbackTypeResponses] && question[feedbackTypeResponses].feedback && question[feedbackTypeResponses].feedback.specific &&
      _.find(question[feedbackTypeResponses].feedback.specific, function(fb) {
        return fb.answer === answer;
      });
    if (specificFeedback) {
      return specificFeedback.feedback;
    }
    var feedbackTemplate = getFeedbackTemplate(question, response);
    var result = replaceVariables(feedbackTemplate, question);
    return result;
  }

  function replaceVariables(template, question) {
    if (template) {
      return template.replace("<random selection from correct answers>", randomCorrectAnswer(question));
    }
  }

  function randomCorrectAnswer(question) {
    var result = _.sample(question.correctResponses.values);
    return result;
  }

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  if (exports.isCorrect(answer, question.correctResponses)) {
    response = createResponse("correct", 100);
  } else if (exports.isCorrect(answer, question.partialResponses)) {
    response = createResponse("incorrect", question.partialResponses.award);
  } else {
    response = createResponse("incorrect", 0);
  }

  if (settings.showFeedback) {
    response.feedback = {
      correctness: getFeedbackType(response),
      message: createFeedbackMessage(question, response, answer)
    };
  }
  return response;
};