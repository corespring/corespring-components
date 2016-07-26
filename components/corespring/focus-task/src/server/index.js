var _ = require('lodash');

exports.isCorrect = isCorrect;
exports.buildFeedback = buildFeedback;
exports.createOutcome = createOutcome;

exports.feedback = {
  NO_ANSWER: 'You did not enter a response'
};

function isCorrect(answer, correctAnswer) {
  var diff, diff2;
  diff = _.difference(answer, correctAnswer);
  diff2 = _.difference(correctAnswer, answer);
  return diff.length === 0 && diff2.length === 0;
}


function buildFeedback(question, answer, settings, isCorrect) {
  var out = {};
  var correctResponse = question.correctResponse.value;
  var arr = [];

  if (settings.highlightUserResponse) {
    arr = answer || [];
  }

  if (settings.highlightCorrectResponse) {
    arr = _.union(arr, correctResponse);
  }

  for (var i = 0; i < arr.length; i++) {
    var key = arr[i];
    out[key] =  (_.contains(correctResponse, key)) ? 'shouldHaveBeenSelected' : 'shouldNotHaveBeenSelected';
  }

  if (!answer || _.isEmpty(answer)) {
    out.emptyAnswer = true;
    out.message = exports.feedback.NO_ANSWER;
  }

  return out;
}

/*
 Create a response to the answer based on the question, the answer and the respond settings
 */
function createOutcome(question, answer, settings) {

  if(!question || _.isEmpty(question)) {
    throw new Error('question should never be undefined or empty');
  }

  if (!answer || answer.length === 0) {
    return {
      correctness: 'incorrect',
      correctClass: 'nothing-submitted',
      score: 0,
      feedback: settings.showFeedback ?
        buildFeedback(question, answer, settings, answerIsCorrect) : null,
      outcome: settings.showFeedback ? ["responsesBelowMin"] : null
    };
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var config = question.model.config || {};
  var minSelections = config.minSelections || 0;
  var maxSelections = config.maxSelections || Number.MAX_VALUE;
  var checkIfCorrect = config.checkIfCorrect === "yes" || config.checkIfCorrect === "true" || config.checkIfCorrect === true;
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
}
