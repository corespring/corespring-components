var _ = require('lodash');

var wordRegexp = /([^<\w]|^)([\w';|&]+)()(?!>)/g;
var sentenceRegexp = /()(\|*[A-Z](?:.|\n)+?)([.?!])/g;

exports.preprocessText = function(text) {
  var nameRegexp = /([A-Z][a-z]+ [A-Z])\.( [A-Z][a-z]+)/g;
  var result = text.replace(nameRegexp, "$1&#46;$2");
  return result;
};

exports.tokenizeText = function (text, selectionUnit) {
  var tokens = [];

  var regexp = selectionUnit == "sentence" ? sentenceRegexp : wordRegexp;
  var match;
  while (match = regexp.exec(exports.preprocessText(text))) {
    tokens.push(match[2]);
  }
  return tokens;
};

var buildCorrectIndexesArray = function (text, selectionUnit) {
  var correctIndexes = [];

  var regexp = selectionUnit == "sentence" ? sentenceRegexp : wordRegexp;
  var idx = 0;
  var match;
  while (match = regexp.exec(text)) {
    var correctTokenMatch = match[0].match(/[|](.*)/);
    if (correctTokenMatch) {
      correctIndexes.push(""+idx);
    }
    idx++;
  }
  return correctIndexes;
};

var buildFeedback = function(answer, correctIndexes) {
  var feedback = {};
  _.each(correctIndexes, function(correctIndex) {
    feedback[correctIndex] = {
      wouldBeCorrect: true
    };
  });
  _.each(answer, function(answerIndex) {
     feedback[answerIndex] = {
       correct: _.contains(correctIndexes, answerIndex)
     };
  });
  return feedback;
};

exports.respond = function (question, answer, settings) {
  var text = exports.preprocessText(question.model.text);
  var correctIndexes = buildCorrectIndexesArray(text, question.model.config.selectionUnit);

  var isCorrect = _.isEqual(answer, correctIndexes);

  var res = {
    correctness: isCorrect ? "correct" : "incorrect",
    score: isCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    res.feedback = buildFeedback(answer, correctIndexes);
  }

  return res;
};
