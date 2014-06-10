var _ = require('lodash');

exports.DEFAULT_CORRECT_FEEDBACK = "Correct!";
exports.DEFAULT_PARTIAL_FEEDBACK = "Almost!";
exports.DEFAULT_INCORRECT_FEEDBACK = "Good try, but that is not the correct answer.";

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

  var fbSelector = isCorrect(question, answer) ? "correctFeedback" : (isPartiallyCorrect(question, answer) ?
    "partialFeedback" : "incorrectFeedback");
  var fbTypeSelector = fbSelector + "Type";

  var feedbackType = question.feedback && question.feedback[fbTypeSelector] ? question.feedback[fbTypeSelector] : "default";

  if (feedbackType === "custom") {
    feedback.message = question.feedback[fbSelector];
  } else if (feedbackType === "default") {
    feedback.message = isCorrect(question, answer) ? exports.DEFAULT_CORRECT_FEEDBACK :
      (isPartiallyCorrect(question, answer) ? exports.DEFAULT_PARTIAL_FEEDBACK : exports.DEFAULT_INCORRECT_FEEDBACK);
  }

  if (checkIfCorrect) {
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
  var selectionCount = answer.length;
  var minSelection = question.model.config.minSelections || 0;
  var maxSelection = question.model.config.maxSelections || Number.MAX_VALUE;
  return (minSelection <= selectionCount && maxSelection >= selectionCount);
}

function isEverySelectedCorrect(question, answer) {
  return _.every(answer, function(a) {
    return _.contains(correctIndexes(question), a);
  });
}

function areSomeSelectedCorrect(question, answer) {
  return _.find(answer, function(a) {
    return _.contains(correctIndexes(question), a);
  }) !== undefined;
}

function isCorrect(question, answer) {

  var correct = selectionCountIsFine(question, answer);

  if (checkIfCorrect(question)) {
    correct &= isEverySelectedCorrect(question, answer);
  }

  return correct;
}

function isPartiallyCorrect(question, answer) {
  var partiallyCorrect = selectionCountIsFine(question, answer);

  if (checkIfCorrect(question)) {
    partiallyCorrect &= areSomeSelectedCorrect(question, answer);
  }
  return partiallyCorrect;
}

exports.respond = function(question, answer, settings) {

  var res = {
    correctness: isCorrect(question, answer) ? "correct" : "incorrect",
    score: isCorrect(question, answer) ? 1 : 0
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
    if (checkIfCorrect && !isEverySelectedCorrect) {
      res.outcome.push("responsesIncorrect");
    }

    res.correctClass = isCorrect(question, answer) ? 'correct' :
      (isPartiallyCorrect(question, answer) ? 'partial' : 'incorrect');

  }

  return res;
};
