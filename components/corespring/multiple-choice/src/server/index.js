var _ = require('lodash');

exports.render = function(element) {
  element.choices = _.map(element.choices, function(e) {
    return {
      label: e.label,
      value: e.value
    };
  });
  delete element.points;
  delete element.correctResponse;
  delete element.feedback;
  return element;
};

var feedbackByValue = function(q, v) {
  var originalFb = _.find(q.feedback, function(f) {
    return f.value === v;
  });
  return _.cloneDeep(originalFb);
};

var correctResponseFeedback = function(fbArray, q, userGotItRight, answer) {

  var correctKey, fb, nc, _i, _len, _ref;

  _ref = q.correctResponse.value;

  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    correctKey = _ref[_i];
    fb = feedbackByValue(q, correctKey);

    if(!fb){
      return;
    }

    if (userGotItRight) {
      delete fb.notChosenFeedback;
    } else {
      if (_.indexOf(answer, correctKey) === -1) {
        nc = fb.notChosenFeedback;
        delete fb.notChosenFeedback;
        fb.feedback = nc;
      } else {
        delete fb.notChosenFeedback;
      }
    }
    fb.correct = true;
    fbArray.push(fb);
  }
};

exports.isCorrect = function(answer, correctAnswer) {
  var diff, diff2;
  diff = _.difference(answer, correctAnswer);
  diff2 = _.difference(correctAnswer, answer);
  return diff.length === 0 && diff2.length === 0;
};

var isCorrectChoice = function(q, choice) {
  return _.indexOf(q.correctResponse.value, choice) !== -1;
};

var userResponseFeedback = function(fbArray, q, answer) {
  var fb, userChoice, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = answer.length; _i < _len; _i++) {
    userChoice = answer[_i];
    fb = feedbackByValue(q, userChoice);
    fb.correct = isCorrectChoice(q, userChoice);
    if (fb.correct) {
      delete fb.notChosenFeedback;
    }
    _results.push(fbArray.push(fb));
  }
  return _results;
};

var buildFeedback = function(question, answer, settings, isCorrect) {
  var out;
  out = [];
  if (isCorrect) {
    if (settings.highlightCorrectResponse || settings.highlightUserResponse) {
      correctResponseFeedback(out, question, true, answer);
    }
  } else {
    if (settings.highlightCorrectResponse) {
      correctResponseFeedback(out, question, false, answer);
    }
    if (settings.highlightUserResponse) {
      userResponseFeedback(out, question, answer);
    }
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

  var answerIsCorrect, response;
  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }
  answerIsCorrect = this.isCorrect(answer, question.correctResponse.value);
  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer)
  };
  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings, answerIsCorrect);
  }
  return response;
};
