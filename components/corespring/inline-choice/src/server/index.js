var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');

exports.keys = feedbackUtils.keys;
exports.defaults = feedbackUtils.defaults;
exports.defaults.incorrect = "Good try, but <correct answer> is the correct answer.";
exports.keys.DEFAULT_INCORRECT_FEEDBACK = feedbackUtils.defaults.incorrect;

var feedbackByValue = function(q, v) {
  return _.find(q.feedback, function(f) {
    return f.value === v;
  });
};

var userResponseFeedback = function(q, answer) {

  function correctResponse(question) {
    var maybeAnswer = _.find(question.model.choices, function(choice) {
      return choice.value === question.correctResponse;
    });
    return maybeAnswer ? maybeAnswer.label : undefined;
  }

  function replaceVariables(question, string) {
    return string.replace("<correct answer>", correctResponse(question));
  }

  var fb, userChoice;
  userChoice = answer;
  fb = feedbackByValue(q, userChoice);
  if (fb) {
    fb.correct = isCorrectChoice(q, userChoice);

    if (fb.feedbackType === 'default') {
      fb.feedback = replaceVariables(q, fb.correct ? exports.keys.DEFAULT_CORRECT_FEEDBACK : exports.keys.DEFAULT_INCORRECT_FEEDBACK);
    } else if (fb.feedbackType === 'none') {
      delete fb.feedback;
    }
    delete fb.value;
    return fb;
  }
};

exports.preprocess = function(json) {
  _.forEach(json.model.choices, function(choice) {
    delete choice.rationale;
  });
  return json;
};

exports.isCorrect = function(answer, correctAnswer) {
  return answer === correctAnswer;
};

var isCorrectChoice = function(q, choice) {
  return q.correctResponse === choice;
};

var buildFeedback = function(question, answer, settings, isCorrect) {
  var out;
  if (settings.highlightUserResponse) {
    out = userResponseFeedback(question, answer);
  }
  return out;
};

var calculateScore = function(question, answer) {
  return question.correctResponse === answer ? 1.0 : 0.0;
};

/*
 Create a response to the answer based on the question, the answer and the respond settings
 */


exports.respond = function(question, answer, settings) {
  var answerIsCorrect, response;

  if(!answer){
    return {
      correctness: 'incorrect',
      score: 0,
      feedback: settings.showFeedback ? buildFeedback(question, answer, settings, false) : null
    };
  }
  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }
  answerIsCorrect = this.isCorrect(answer, question.correctResponse);
  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer)
  };
  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings, answerIsCorrect);
  }
  return response;
};
