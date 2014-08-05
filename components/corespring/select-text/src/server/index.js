var _ = require('lodash');

var feedbackUtils = require('corespring.server-shared.server.feedback-utils');
var keys = feedbackUtils.keys;

exports.keys = keys;

exports.wrapTokensWithHtml = function(choices) {
  var idx = 0;
  return _(choices).map(function(choice) {
    return "<span class='token' id='" + (idx++) + "'>" + choice.data + "</span>";
  }).value().join(' ');
};

function correctIndexes(question) {
  var indexes = [];
  for (var i in question.model.choices) {
    if (question.model.choices[i].correct) {
      indexes.push(i);
    }
  }
  return indexes;
}

var buildFeedback = function(question, answer) {

  var feedback = {
    choices: {}
  };

  var fbSelector;
  if (!checkIfCorrect(question)) {
    fbSelector = "feedback";
  } else {
    fbSelector = isCorrect(question, answer) ? "correctFeedback" : (isPartiallyCorrect(question, answer) ?
      "partialFeedback" : "incorrectFeedback");
  }

  var fbTypeSelector = fbSelector + "Type";

  var feedbackType = question.feedback && question.feedback[fbTypeSelector] ? question.feedback[fbTypeSelector] : "default";

  if (feedbackType === "custom") {
    feedback.message = question.feedback[fbSelector];
  } else if (feedbackType === "default") {
    feedback.message = checkIfCorrect(question) ? (isCorrect(question, answer) ? keys.DEFAULT_CORRECT_FEEDBACK :
      (isPartiallyCorrect(question, answer) ? keys.DEFAULT_PARTIAL_FEEDBACK : keys.DEFAULT_INCORRECT_FEEDBACK)) : keys.DEFAULT_SUBMITTED_FEEDBACK;
  }

  if (checkIfCorrect(question)) {
    _.each(correctIndexes(question), function(correctIndex) {
      feedback.choices[correctIndex] = {
        wouldBeCorrect: true
      };
    });
  }

  _.each(answer, function(answerIndex) {
    feedback.choices[answerIndex] = {
      correct: (!checkIfCorrect(question) && selectionCountIsFine(question, answer)) ||
        (checkIfCorrect(question) && _.contains(correctIndexes(question), answerIndex))
    };
  });

  return feedback;
};

exports.preprocess = function(json) {
  json.wrappedText = exports.wrapTokensWithHtml(json.model.choices);
  return json;
};

function checkIfCorrect(question) {
  return question.model.config.checkIfCorrect === undefined ?
    false : question.model.config.checkIfCorrect;
}

function selectionCountIsFine(question, answer) {

  if(!answer){
    return false;
  }
  
  var selectionCount = answer.length;
  var minSelection = question.model.config.minSelections || 0;
  var maxSelection = question.model.config.maxSelections || Number.MAX_VALUE;
  return (minSelection <= selectionCount && maxSelection >= selectionCount);
}

function areAllCorrectSelected(question, answer) {
  return numberOfCorrectAnswers(question, answer) === correctIndexes(question).length;
}

function areSomeSelectedCorrect(question, answer) {
  return numberOfCorrectAnswers(question, answer) !== 0;
}

function numberOfCorrectAnswers(question, answers) {
  var correctCount = _(answers)
    .filter(function(answer) {
      return _.contains(correctIndexes(question), answer);
    }).value().length;
  return correctCount;
}

function isCorrect(question, answer) {
  var correct;

  if (correctIndexes(question).length === 0) {
    return false;
  } else {
    correct = selectionCountIsFine(question, answer);

    if (checkIfCorrect(question)) {
      correct &= areAllCorrectSelected(question, answer);
    }

    return correct;
  }
}

function isPartiallyCorrect(question, answer) {
  var partiallyCorrect;

  if (correctIndexes(question).length === 0) {
    return false;
  } else {
    partiallyCorrect = selectionCountIsFine(question, answer);

    if (checkIfCorrect(question)) {
      partiallyCorrect &= areSomeSelectedCorrect(question, answer);
    }
    return partiallyCorrect;
  }
}

function score(question, answer) {
  var scoreValue = 0;

  if (!checkIfCorrect(question)) {
    return 1;
  }

  if (isCorrect(question, answer)) {
    scoreValue = 1;
  } else if (question.allowPartialScoring) {
    var partialScore = _.find(question.partialScoring, function(ps) {
      return ps.numberOfCorrect === numberOfCorrectAnswers(question, answer);
    });

    if (partialScore) {
      scoreValue = partialScore.scorePercentage / 100;
    }
  }
  return scoreValue;
}

exports.respond = function(question, answer, settings) {

  if(!question || _.isEmpty(question)){
    throw new Error('question should never be empty or null');
  }

  if(!answer){
    return {
      correctness: 'incorrect', 
      score: 0,
      feedback: settings.showFeedback ? buildFeedback(question, answer) : null,
      outcome: [],
      correctClass: settings.showFeedback ? 'incorrect' : null
    };
  }

  var res = {
    correctness: isCorrect(question, answer) ? "correct" : "incorrect",
    score: score(question, answer)
  };

  var selectionCount = answer.length;
  var minSelection = question.model.config.minSelections || 0;
  var maxSelection = question.model.config.maxSelections || Number.MAX_VALUE;

  if (settings.showFeedback) {
    res.feedback = buildFeedback(question, answer);

    res.outcome = [];

    res.comments = question.comments;

    if (selectionCount < minSelection) {
      res.outcome.push("responsesBelowMin");
    } else if (selectionCount > maxSelection) {
      res.outcome.push("responsesExceedMax");
    } else {
      res.outcome.push("responsesNumberCorrect");
    }

    if (isCorrect(question, answer)) {
      res.outcome.push("responsesCorrect");
    }
    if (checkIfCorrect && !areAllCorrectSelected(question, answer)) {
      res.outcome.push("responsesIncorrect");
    }

    res.correctClass = checkIfCorrect(question) ? (isCorrect(question, answer) ? 'correct' :
      (isPartiallyCorrect(question, answer) ? 'partial' : 'incorrect')) : 'submitted';

  }

  return res;
};
