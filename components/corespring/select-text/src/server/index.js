var _ = require('lodash');

var wordRegexp = /([^<\w]|^)([\w';|&]+)()(?!>)/g;
var sentenceRegexp = /()(\|*[A-Z](?:.|\n)+?)([.?!])/g;

exports.preprocessText = function (text) {

  var nameRegexp = /([A-Z][a-z]+ [A-Z])\.( [A-Z][a-z]+)/g;
  var correctOpenTagRegexp = /<correct>/ig;
  var correctCloseTagRegexp = /<\/correct>/ig;

  var result = text.replace(nameRegexp, "$1&#46;$2")
  .replace(correctOpenTagRegexp, "|")
  .replace(correctCloseTagRegexp, "");

  return result;
};

exports.tokenizeText = function (text, selectionUnit) {
  var tokens = [];

  var regexp = selectionUnit === "sentence" ? sentenceRegexp : wordRegexp;
  var match;
  while (match = regexp.exec(exports.preprocessText(text))) {
    tokens.push(match[2]);
  }
  return tokens;
};

exports.wrapTokensWithHtml = function (text, selectionUnit) {
  var regexp = selectionUnit === "sentence" ? sentenceRegexp : wordRegexp;
  var idx = 0;
  var wrappedToken = text.replace(regexp, function (match, prefix, token, delimiter) {
    var cs = "";
    var prefixTags = "";
    var correctTokenMatch = token.match(/[|](.*)/);
    if (correctTokenMatch) {
      token = correctTokenMatch[1];
      cs = 'correct="true"';
    }
    return prefix + "<span class='token' " + cs + "id='" + (idx++) + "'>" + prefixTags + token + "</span>" + delimiter;
  });
  return wrappedToken;
};

var buildCorrectIndexesArray = function (text, selectionUnit) {
  var correctIndexes = [];

  var regexp = selectionUnit === "sentence" ? sentenceRegexp : wordRegexp;
  var idx = 0;
  var match;
  while (match = regexp.exec(text)) {
    var correctTokenMatch = match[0].match(/[|](.*)/);
    if (correctTokenMatch) {
      correctIndexes.push("" + idx);
    }
    idx++;
  }
  return correctIndexes;
};

var buildFeedback = function (answer, correctIndexes, checkIfCorrect, selectionCountIsFine) {
  var feedback = {};

  if (checkIfCorrect) {
    _.each(correctIndexes, function (correctIndex) {
      feedback[correctIndex] = {
        wouldBeCorrect: true
      };
    });
  }
  _.each(answer, function (answerIndex) {
    feedback[answerIndex] = {
      correct: (!checkIfCorrect && selectionCountIsFine) || (checkIfCorrect && _.contains(correctIndexes, answerIndex))
    };
  });
  return feedback;
};

exports.render = function (json) {

  json.wrappedText = exports.wrapTokensWithHtml(exports.preprocessText(json.model.text), json.model.config.selectionUnit);

  return json;
};

exports.respond = function (question, answer, settings) {

  var text = exports.preprocessText(question.model.text);

  var selectionCount = answer.length;
  var minSelection = question.model.config.minSelections || 0;
  var maxSelection = question.model.config.maxSelections || Number.MAX_VALUE;
  var checkIfCorrect = (question.model.config.checkIfCorrect === "yes" || question.model.config.checkIfCorrect === "true");


  var correctIndexes = buildCorrectIndexesArray(text, question.model.config.selectionUnit);
  var selectionCountIsFine = (minSelection <= selectionCount && maxSelection >= selectionCount);
  var isEverySelectedCorrect = _.every(answer, function (a) {
    return _.contains(correctIndexes, a);
  });
  var isCorrect = selectionCountIsFine;
  
  if (checkIfCorrect){
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
  }
  else if (selectionCount > maxSelection){
    res.outcome.push("responsesExceedMax");
  }
  else {
    res.outcome.push("responsesNumberCorrect");
  }

  if (isCorrect) { 
    res.outcome.push("responsesCorrect");
  }
  if (checkIfCorrect && !isEverySelectedCorrect) { 
    res.outcome.push("responsesIncorrect");}
  }

return res;
};
