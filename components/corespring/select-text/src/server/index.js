var _ = require('lodash');

exports.wrapTokensWithHtml = function(selections) {
  var idx = 0;
  return _(selections).map(function(selection) {
    return "<span class='token' id='" + (idx++) + "'>" + selection.data + "</span>";
  }).value().join(' ');
};

function buildCorrectIndexesArray(selections) {
  var correctIndexes = [];
  for (var i in selections) {
    if (selections[i].correct) {
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
  json.wrappedText = exports.wrapTokensWithHtml(json.model.selections);
  return json;
};

exports.respond = function(question, answer, settings) {
  var selectionCount = answer.length;
  var minSelection = question.model.config.minSelections || 0;
  var maxSelection = question.model.config.maxSelections || Number.MAX_VALUE;

  var checkIfCorrect = question.model.config.checkIfCorrect === undefined ?
    false : question.model.config.checkIfCorrect;

  var correctIndexes = buildCorrectIndexesArray(question.model.selections);

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
