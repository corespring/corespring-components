var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');

exports.keys = feedbackUtils.keys;
exports.defaults = feedbackUtils.defaults;

var CORRECT_ANSWER_PLACEHOLDER = "<correct answer>";
var DEFAULT_INCORRECT_FEEDBACK = "Good try, but " + CORRECT_ANSWER_PLACEHOLDER + " is the correct answer.";

function isCorrectResponse(question, answer){
  return _.contains(question.correctResponse, answer);
}

function feedbackByValue(question, answer) {

  var feedbackValue =  _.find(question.feedback, function(f) {
    return f.value === answer;
  });

  function getRandomCorrectResponse() {
    var uid = _.sample(question.correctResponse);
    var maybeAnswer = (question.model && question.model.choices) ? _.find(question.model.choices, function(choice) {
      return choice.value === uid;
    }) : undefined;
    return maybeAnswer ? maybeAnswer.label : undefined;
  }

  var hasDefaultFeedback = feedbackValue && feedbackValue.feedbackType === 'default';

  function setDefaults(feedbackValue) {
    feedbackValue.feedback = isCorrectResponse(question, answer) ? exports.keys.DEFAULT_CORRECT_FEEDBACK :
      DEFAULT_INCORRECT_FEEDBACK.replace(CORRECT_ANSWER_PLACEHOLDER, getRandomCorrectResponse());
    return feedbackValue;
  }

  return hasDefaultFeedback ? setDefaults(feedbackValue) : feedbackValue;
}

exports.feedbackByValue = feedbackByValue;

function userResponseFeedback(question, answer) {
  var fb = feedbackByValue(question, answer);

  if (fb) {
    fb.correct = isCorrectResponse(question, answer);
    if (fb.feedbackType === 'none') {
      delete fb.feedback;
    }
    delete fb.value;
    return fb;
  }
}

exports.preprocess = function(json) {
  _.forEach(json.model.choices, function(choice) {
    delete choice.rationale;
  });
  return json;
};

exports.isCorrect = function(answer, correctAnswer) {
  return _.contains(correctAnswer, answer);
};

var buildFeedback = function(question, answer, settings) {
  var out;
  if (settings.highlightUserResponse) {
    out = userResponseFeedback(question, answer);
  }
  return out;
};

var calculateScore = function(question, answer) {
  return _.contains(question.correctResponse, answer) ? 1.0 : 0.0;
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
      feedback: settings.showFeedback ? buildFeedback(question, answer, settings) : null
    };
  }
  if(!question){
    throw "question is undefined";
  }
  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }
  answerIsCorrect = this.isCorrect(answer, question.correctResponse);

  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer)
  };
  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings);
  }
  return response;
};
