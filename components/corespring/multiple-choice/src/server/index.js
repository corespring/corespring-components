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
        nc = fb.notChosenFeedback || exports.keys.DEFAULT_NOT_CHOSEN_FEEDBACK;
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

exports.preprocess = function(json) {
  if (_.isUndefined(json.model.config.choiceType)) {
    json.model.config.choiceType = (json.correctResponse.value.length === 1) ? "radio" : "checkbox";
  }
  _.forEach(json.model.choices, function(choice) {
    delete choice.rationale;
  });
  return json;
};

exports.isCorrect = function(answer, correctAnswer, isSingleChoice) {
  var diff, diff2;
  diff = _.difference(answer, correctAnswer);
  diff2 = _.difference(correctAnswer, answer);
  return diff.length === 0 && (diff2.length === 0 || isSingleChoice);
};

exports.isPartiallyCorrect = function(answers, correctAnswers) {
  var countAnsweredCorrectly = _.reduce(answers, function(sum,answer) {
    var increment = _.contains(correctAnswers, answer) ? 1 : 0;
    return sum + increment;
  },0);
  return countAnsweredCorrectly < correctAnswers.length;
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

var calculateScore = function(question, answer, isSingleChoice) {

  var countAnsweredCorrectly = function() {
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

  var definedAsCorrect = question.correctResponse.value.length;
  var answeredCorrectly = countAnsweredCorrectly();

  if (answeredCorrectly === 0) {
    return 0;
  }

  if (answeredCorrectly === definedAsCorrect) {
    return 1;
  }

  if (isSingleChoice) {
    return answeredCorrectly > 0;
  }

  if (definedAsCorrect > 1 && question.allowPartialScoring){
    return calculatePartialScore(answeredCorrectly) / 100;
  }else{
    return (answeredCorrectly === definedAsCorrect) ? 1 : 0;
  }
};


/*
 Create a response to the answer based on the question, the answer and the respond settings
 */
exports.respond = function(question, answer, settings) {
  if(_.isEmpty(answer)) {
    return {
      correctness: 'incorrect',
      score: 0,
      feedback: settings.showFeedback ? buildFeedback(question, answer, settings, false) : null
    };
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var isSingleChoice = question.model.config.choiceType === "radio";
  var answerIsCorrect = this.isCorrect(answer, question.correctResponse.value, isSingleChoice);

  var response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer, isSingleChoice),
    comments: question.comments
  };

  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings, answerIsCorrect);
  }

  return response;
};
