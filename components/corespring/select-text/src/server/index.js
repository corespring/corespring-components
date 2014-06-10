var _ = require('lodash');

exports.DEFAULT_CORRECT_FEEDBACK = "Correct!";
exports.DEFAULT_PARTIAL_FEEDBACK = "Almost!";
exports.DEFAULT_INCORRECT_FEEDBACK = "Good try but that is not the correct answer.";

exports.wrapTokensWithHtml = function(choices) {
  var idx = 0;
  return _(choices).map(function(choice) {
    return "<span class='token' id='" + (idx++) + "'>" + choice.data + "</span>";
  }).value().join(' ');
};

function buildCorrectIndexesArray(choices) {
  var correctIndexes = [];
  for (var i in choices) {
    if (choices[i].correct === true) {
      correctIndexes.push(i);
    }
  }
  return correctIndexes;
}

var buildFeedback = function(answer, correctIndexes, checkIfCorrect, selectionCountIsFine) {
  var feedback = {};

  if (checkIfCorrect) {
    _.each(correctIndexes, function(correctIndex) {
      feedback[correctIndex] = {
        wouldBeCorrect: true
      };
    });
  }
  _.each(answer, function(answerIndex) {
    feedback[answerIndex] = {
      correct: (!checkIfCorrect && selectionCountIsFine) || (checkIfCorrect && _.contains(correctIndexes, answerIndex))
    };
  });
  return feedback;
};

exports.preprocess = function(json) {
  json.wrappedText = exports.wrapTokensWithHtml(json.model.choices);
  return json;
};

exports.respond = function(question, answer, settings) {
  var selectionCount = answer.length;
  var minSelection = question.model.config.minSelections || 0;
  var maxSelection = question.model.config.maxSelections || Number.MAX_VALUE;

  var checkIfCorrect = question.model.config.checkIfCorrect === undefined ?
    false : question.model.config.checkIfCorrect;

  var correctIndexes = buildCorrectIndexesArray(question.model.choices);

  var selectionCountIsFine = (minSelection <= selectionCount && maxSelection >= selectionCount);

  var isEverySelectedCorrect = _.every(answer, function(a) {
    return _.contains(correctIndexes, a);
  });

  var isCorrect = selectionCountIsFine;

  if (checkIfCorrect) {
    isCorrect &= isEverySelectedCorrect;
  }

  var res = {
    correctness: isCorrect ? "correct" : "incorrect",
    score: isCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    res.feedback = buildFeedback(answer, correctIndexes, checkIfCorrect, selectionCountIsFine);

    res.outcome = [];

    if (selectionCount < minSelection) {
      res.outcome.push("responsesBelowMin");
    } else if (selectionCount > maxSelection) {
      res.outcome.push("responsesExceedMax");
    } else {
      res.outcome.push("responsesNumberCorrect");
    }

    if (isCorrect) {
      res.outcome.push("responsesCorrect");
    }
    if (checkIfCorrect && !isEverySelectedCorrect) {
      res.outcome.push("responsesIncorrect");
    }
  }

  return res;
};
