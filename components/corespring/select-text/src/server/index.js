var _ = require('lodash');

var feedbackUtils = require('corespring.server-shared.server.feedback-utils');
var keys = feedbackUtils.keys;

exports.keys = keys;
exports.createOutcome = createOutcome;

function createOutcome(question, answer, settings) {
  if(_.isEmpty(question)){
    throw new Error('question should never be empty');
  }

  if (_.isEmpty(answer)) {
    return {
      correctness: 'incorrect',
      correctClass: 'warning',
      warningClass: 'answer-expected',
      score: 0,
      feedback: settings.showFeedback ? {
        emptyAnswer: true,
        message: keys.DEFAULT_WARNING_FEEDBACK
      } : null
    };
  }

  var res = {
    correctness: correctness(question, answer),
    score: score(question, answer)
  };

  var selectionCount = answer.length;

  if (settings.showFeedback) {
    res.feedback = buildFeedback(question, answer);
    res.outcome = [];
    res.comments = question.comments;

    if (isCorrect(question, answer)) {
      res.outcome.push("responsesCorrect");
    } else if (areSomeSelectedCorrect(question, answer)) {
      res.outcome.push("responsesPartiallyIncorrect");
    } else if (!areAllCorrectSelected(question, answer)) {
      res.outcome.push("responsesIncorrect");
    }

    res.correctResponse = question.correctResponse.value;
    res.correctClass = res.correctness;
  }

  return res;
}


function buildFeedback(question, answer) {
  var feedback = {
    choices: []
  };
  var fbSelector = isCorrect(question, answer) ? "correctFeedback" : (question.allowPartialScoring ? (isPartiallyCorrect(question, answer) ? "partialFeedback" : "incorrectFeedback") : "incorrectFeedback");
  var fbTypeSelector = fbSelector + "Type";
  var feedbackType = question.feedback && question.feedback[fbTypeSelector] ? question.feedback[fbTypeSelector] : "default";

  if (feedbackType === "custom") {
    feedback.message = question.feedback[fbSelector];
  } else if (feedbackType === "default") {
    feedback.message = isCorrect(question, answer) ? keys.DEFAULT_CORRECT_FEEDBACK : (question.allowPartialScoring ? (isPartiallyCorrect(question, answer) ? keys.DEFAULT_PARTIAL_FEEDBACK : keys.DEFAULT_INCORRECT_FEEDBACK) : keys.DEFAULT_INCORRECT_FEEDBACK);
  }

  _.each(answer, function(answerIndex) {
    feedback.choices.push({
      index: answerIndex,
      correct: _.contains(question.correctResponse.value, answerIndex)
    });
  });

  return feedback;
}

function selectionCountIsFine(question, answer) {
  if (!answer) {
    return false;
  }

  var selectionCount = answer.length;
  var maxSelections = question.model.config.maxSelections;
  var correctSelectionCount = question.correctResponse.value.length;

  return (maxSelections === 0 && selectionCount === correctSelectionCount) ||
    (selectionCount === correctSelectionCount && selectionCount === maxSelections);
}

function areAllCorrectSelected(question, answer) {
  return numberOfCorrectAnswers(question, answer) === question.correctResponse.value.length;
}

function areSomeSelectedCorrect(question, answer) {
  return numberOfCorrectAnswers(question, answer) > 0;
}

function numberOfCorrectAnswers(question, answers) {
  var correctCount = _(answers)
    .filter(function(answer) {
      return _.contains(question.correctResponse.value, answer);
    })
    .value()
    .length;
  return correctCount;
}

function isCorrect(question, answer) {
  var correct = selectionCountIsFine(question, answer) &&
    areAllCorrectSelected(question, answer);
  return correct;
}

function isPartiallyCorrect(question, answer) {
  if (!answer) {
    return false;
  }
  var partiallyCorrect = areSomeSelectedCorrect(question, answer);
  return partiallyCorrect;
}

function correctness(question, answer) {
  if (isCorrect(question, answer)) {
    return "correct";
  }
  if (isPartiallyCorrect(question, answer)) {
    return "partial";
  }
  return "incorrect";
}

function score(question, answer) {
  var scoreValue = 0;
  var partialScore = null;
  if (isCorrect(question, answer)) {
    scoreValue = 1;
  } else if (question.allowPartialScoring) {
    partialScore = _.find(question.partialScoring, function(ps) {
      return ps.numberOfCorrect === numberOfCorrectAnswers(question, answer);
    });
    if (partialScore) {
      scoreValue = partialScore.scorePercentage / 100;
    }
  }
  return scoreValue;
}

