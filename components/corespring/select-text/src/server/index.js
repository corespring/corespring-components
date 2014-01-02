var _ = require('lodash');

var wordRegexp = /([^<\w]|^)([\w';|&]+)()(?!>)/g;
var sentenceRegexp = /()(\|*[A-Z].+?)([.?!])/g;

exports.tokenizeText = function (text, selectionUnit) {
  var tokens = [];

  var regexp = selectionUnit == "sentence" ? sentenceRegexp : wordRegexp;
  var match;
  while (match = regexp.exec(text)) {
    tokens.push(match[2]);
  }
  console.log("tok: "+ tokens);
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
  console.log("Responding");
  console.log(JSON.stringify(question.model.text));

  var text = question.model.text;
  var correctIndexes = buildCorrectIndexesArray(text, question.model.config.selectionUnit);
  var tokens = exports.tokenizeText(text, question.model.config.selectionUnit);
  console.log(tokens);
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
