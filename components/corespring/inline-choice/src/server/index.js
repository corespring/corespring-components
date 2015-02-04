var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');

exports.keys = feedbackUtils.keys;
exports.defaults = feedbackUtils.defaults;

var CORRECT_ANSWER_PLACEHOLDER = "<correct answer>";
var DEFAULT_INCORRECT_FEEDBACK = "Good try, but " + CORRECT_ANSWER_PLACEHOLDER + " is the correct answer.";

/**
 * This makes sure that old items with a string as correctResponse are still working
 */
function ensureCorrectResponseIsArray(question){
  if(_.isArray(question.correctResponse)){
    return;
  }
  if(_.isString(question.correctResponse) && question.correctResponse.trim().length > 0){
    question.correctResponse = [question.correctResponse];
    return;
  }
  question.correctResponse = [];
}

function isCorrectResponse(question, answer){
  return _.contains(question.correctResponse, answer);
}

function findChoice(question, value) {
  if (question.model && question.model.choices) {
    return _.find(question.model.choices, function (choice) {
      return choice.value === value;
    });
  }
  return undefined;
}

function findFeedback(question, value) {
  if (question.feedback) {
    return _.find(question.feedback, function (fb) {
      return fb.value === value;
    });
  }
  return undefined;
}

function getResponseLabel(question, uid){
  var maybeAnswer = findChoice(question, uid);
  return maybeAnswer ? maybeAnswer.label : undefined;
}

function getRandomCorrectResponse(question) {
  return getResponseLabel(question, _.sample(question.correctResponse));
}

function getFirstCorrectResponse(question) {
  return getResponseLabel(question, question.correctResponse[0]);
}

function getDefaultFeedback(question, answer, getPlaceHolderReplacement) {
  return isCorrectResponse(question, answer) ?
    exports.keys.DEFAULT_CORRECT_FEEDBACK :
    DEFAULT_INCORRECT_FEEDBACK.replace(CORRECT_ANSWER_PLACEHOLDER, getPlaceHolderReplacement(question));
}

function defaultFeedback(question, answer){
  //in the editor we cannot use random bc. it results into a digest loop
  return getDefaultFeedback(question, answer, getFirstCorrectResponse);
}

function userResponseFeedback(question, answer) {
  var fb = findFeedback(question, answer);
  if (fb) {
    if(fb.feedbackType === 'default'){
      fb.feedback = getDefaultFeedback(question, answer, getRandomCorrectResponse);
    }
    fb.correct = isCorrectResponse(question, answer);
    if (fb.feedbackType === 'none') {
      delete fb.feedback;
    }
    delete fb.value;
    return fb;
  }
}

function buildFeedback(question, answer, settings) {
  var out;
  if (settings.highlightUserResponse) {
    out = userResponseFeedback(question, answer);
  }
  return out;
}

function calculateScore(question, answer) {
  return _.contains(question.correctResponse, answer) ? 1.0 : 0.0;
}

//used by configure
exports.defaultFeedback = defaultFeedback;

//use by configure;
exports.ensureCorrectResponseIsArray = ensureCorrectResponseIsArray;

//exposed to make testing easier
exports.isCorrect = isCorrectResponse;



exports.preprocess = function(json) {
  _.forEach(json.model.choices, function(choice) {
    delete choice.rationale;
  });
  return json;
};

/**
 * Create a response to the answer based on the question, the answer and the respond settings
 */
exports.createOutcome = function(question, answer, settings) {
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
  ensureCorrectResponseIsArray(question);
  answerIsCorrect = isCorrectResponse(question, answer);

  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer)
  };
  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings);
  }
  return response;
};

//@deprecated
exports.respond = exports.createOutcome;
