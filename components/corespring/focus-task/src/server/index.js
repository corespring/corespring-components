var _ = require('lodash');

exports.isCorrect = function(answer, correctAnswer) {
  var diff, diff2;
  diff = _.difference(answer, correctAnswer);
  diff2 = _.difference(correctAnswer, answer);
  return diff.length === 0 && diff2.length === 0;
};


var buildFeedback = function(question, answer, settings, isCorrect) {
  var out = {};
  var correctResponse = question.correctResponse.value;
  var arr = [];

  if (settings.highlightUserResponse) {
    arr = answer;
  }

  if (settings.highlightCorrectResponse) {
    arr = _.union(arr, correctResponse);
  }

  for (var _i = 0; _i < arr.length; _i++) {
    var key = arr[_i];
    var fb = "";
    if (_.contains(correctResponse, key)) {
      fb = "shouldHaveBeenSelected";
    } else {
      fb = "shouldNotHaveBeenSelected";
    }
    out[key] = fb;
  }

  return out;
};


/*
 Create a response to the answer based on the question, the answer and the respond settings
 */
exports.respond = function(question, answer, settings) {

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var config = question.model.config || {};
  var minSelections = config.minSelections || 0;
  var maxSelections = config.maxSelections || Number.MAX_VALUE;
  var checkIfCorrect = config.checkIfCorrect === "yes" || config.checkIfCorrect === "true";
  var selectionNumberIsCorrect = answer.length >= minSelections && answer.length <= maxSelections;
  var isAnswerPartOfCorrectAnswer = _.every(answer, function(a) {
     return _.contains(question.correctResponse.value, a);
  });

  var answerIsCorrect = checkIfCorrect ? isAnswerPartOfCorrectAnswer : selectionNumberIsCorrect;
  var answerIsIncorrect = !answerIsCorrect;

  var response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: answerIsCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings, answerIsCorrect);

    response.outcome = [];

    if (selectionNumberIsCorrect) {
      response.outcome.push("responsesNumberCorrect");
      if (answerIsCorrect) {
        response.outcome.push("responsesCorrect");
      }
      if (answerIsIncorrect) {
        response.outcome.push("responsesIncorrect");
      }
    }
    if (answer.length < minSelections) {
      response.outcome.push("responsesBelowMin");
    }
    if (answer.length > maxSelections) {
      response.outcome.push("responsesExceedMax");
    }

  }

  return response;
};
