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

  if (settings.highlightUserResponse)
    arr = answer;

  if (settings.highlightCorrectResponse)
    arr = _.union(arr, correctResponse);

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

var calculateScore = function(question, answer) {

  var countCorrectAnswers = function(){
    var sum = _.reduce(answer, function(sum, a) {
      var contains = _.contains(question.correctResponse.value, a);
      var newsum = sum + (contains ? 1 : 0);
      return newsum;
    }, 0);
    return sum;
  };

  var rawScore, wrongAnswers;
  var maxCorrect = question.correctResponse.value.length;
  var correctCount = countCorrectAnswers();

  if (correctCount === 0) {
    return 0;
  }

  var incorrectCount = answer.length - correctCount;
  var finalIncorrect = correctCount - incorrectCount;

  rawScore = finalIncorrect / maxCorrect;
  return Math.round(rawScore * 100) / 100;
};



/*
 Create a response to the answer based on the question, the answer and the respond settings
 */
exports.respond = function(question, answer, settings) {

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var answerIsCorrect = this.isCorrect(answer, question.correctResponse.value);

  var response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer)
  };

  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings, answerIsCorrect);
  }

  return response;
};
