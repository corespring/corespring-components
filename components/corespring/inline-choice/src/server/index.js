var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');

exports.keys = feedbackUtils.keys;
exports.defaults = feedbackUtils.defaults;

var CORRECT_ANSWER_PLACEHOLDER = "<correct answer>";
var DEFAULT_INCORRECT_FEEDBACK = "Good try, but " + CORRECT_ANSWER_PLACEHOLDER + " is the correct answer.";

var feedbackByValue = function(question, userChoice) {

  var feedbackValue =  _.find(question.feedback, function(f) {
    return f.value === userChoice;
  });

  var correctResponse = (function() {
    var maybeAnswer = (question.model && question.model.choices) ? _.find(question.model.choices, function(choice) {
      return choice.value === question.correctResponse;
    }) : undefined;
    return maybeAnswer ? maybeAnswer.label : undefined;
  })();

  var hasDefaultFeedback = feedbackValue && feedbackValue.feedbackType && feedbackValue.feedbackType === 'default';

  function setDefaults(feedbackValue) {
    feedbackValue.feedback = isCorrectChoice(question, userChoice) ? exports.keys.DEFAULT_CORRECT_FEEDBACK :
      DEFAULT_INCORRECT_FEEDBACK.replace(CORRECT_ANSWER_PLACEHOLDER, correctResponse);
    return feedbackValue;
  }

  return hasDefaultFeedback ? setDefaults(feedbackValue) : feedbackValue;
};

var userResponseFeedback = function(question, userChoice) {
  var fb = feedbackByValue(question, userChoice);

  if (fb) {
    fb.correct = isCorrectChoice(question, userChoice);
    if (fb.feedbackType === 'none') {
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

exports.feedbackByValue = feedbackByValue;

var isCorrectChoice = function(q, choice) {
  return q.correctResponse === choice;
};

var buildFeedback = function(question, answer, settings) {
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
