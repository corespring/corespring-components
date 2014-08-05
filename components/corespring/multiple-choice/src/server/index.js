var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');
var keys = feedbackUtils.keys;

exports.keys = keys;

var feedbackByValue = function(q, v) {
  var originalFb = _.find(q.feedback, function(f) {
    return f.value === v;
  });
  return _.cloneDeep(originalFb);
};

var handleDefaultAndNoneFeedback = function(fb, isCorrect) {
  if (fb.feedbackType === 'default') {
    fb.feedback = isCorrect ? keys.DEFAULT_CORRECT_FEEDBACK : keys.DEFAULT_INCORRECT_FEEDBACK;
  }
  if (fb.notChosenFeedbackType === 'default') {
    fb.notChosenFeedback = keys.DEFAULT_NOT_CHOSEN_FEEDBACK;
  }
  if (fb.feedbackType === 'none') {
    delete fb.feedback;
  }
  if (fb.notChosenFeedbackType === 'none') {
    delete fb.notChosenFeedback;
  }
};

var correctResponseFeedback = function(fbArray, q, userGotItRight, answer) {

  var correctKey, fb, nc, i, _len, correctResponses;

  correctResponses = q.correctResponse.value;

  for (i = 0; i < correctResponses.length; i++) {
    correctKey = correctResponses[i];

    fb = feedbackByValue(q, correctKey) || {
      value: correctKey
    };

    if (!fb) {
      return;
    }

    fb = _.clone(fb);

    handleDefaultAndNoneFeedback(fb, userGotItRight || _.indexOf(answer, correctKey) !== -1);

    if (userGotItRight) {
      delete fb.notChosenFeedback;
    } else {
      if (_.indexOf(answer, correctKey) === -1) {
        nc = fb.notChosenFeedback;
        fb.feedback = nc;
        delete fb.notChosenFeedback;
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
    fb = feedbackByValue(q, userChoice) || {
      value: userChoice
    };
    if (fb) {
      fb.correct = isCorrectChoice(q, userChoice);
      if (fb.correct) {
        delete fb.notChosenFeedback;
      }
      handleDefaultAndNoneFeedback(fb, fb.correct);
      _results.push(fbArray.push(fb));
    }
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
    if (settings.highlightUserResponse && answer) {
      userResponseFeedback(out, question, answer);
    }
  }
  return out;
};

var calculateScore = function(question, answer) {

  var countCorrectAnswers = function() {
    var sum = _.reduce(answer, function(sum, a) {
      var contains = _.contains(question.correctResponse.value, a);
      var newsum = sum + (contains ? 1 : 0);
      return newsum;
    }, 0);
    return sum;
  };

  var calculatePartialScore = function(correctCount) {
    var partialScore = _.find(question.partialScoring, function(ps) {
      return ps.numberOfCorrect === correctCount;
    });

    return _.isUndefined(partialScore) ? 0 : partialScore.scorePercentage;
  };

  var maxCorrect = question.correctResponse.value.length;
  var correctCount = countCorrectAnswers();

  if (correctCount === 0) {
    return 0;
  }

  var incorrectCount = answer.length - correctCount;
  var finalIncorrect = correctCount - incorrectCount;
  var rawScore = finalIncorrect / maxCorrect;
  return question.allowPartialScoring ? (calculatePartialScore(correctCount) / 100) : Math.round(rawScore * 100) / 100;
};


/*
 Create a response to the answer based on the question, the answer and the respond settings
 */
exports.respond = function(question, answer, settings) {

  if(!answer){
    return {
      correctness: 'incorrect',
      score: 0,
      feedback: settings.showFeedback ? buildFeedback(question, answer, settings, false) : null
    };
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var answerIsCorrect = this.isCorrect(answer, question.correctResponse.value);

  var response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer),
    comments: question.comments
  };

  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings, answerIsCorrect);
  }

  return response;
};
