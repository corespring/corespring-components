var _ = require('lodash');

exports.render = function (element) {
  element.choices = _.map(element.choices, function (e) {
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

var feedbackByValue = function (q, v) {
  return q.feedback[v];
};

var correctResponseFeedback = function (fbArray, q, userGotItRight, answer) {
  var correctKey, fb, nc, _i, _len, _ref, _results;
  correctKey = q.correctResponse;
  fb = feedbackByValue(q, correctKey);
  fb.correct = true;
  fbArray[correctKey] = fb;
};

var userResponseFeedback = function (fbArray, q, answer) {
  var fb, userChoice, _i, _len, _results;
  userChoice = answer;
  fb = feedbackByValue(q, userChoice);
  fb.correct = isCorrectChoice(q, userChoice);
  fbArray[userChoice] = fb;
};


exports.isCorrect = function (answer, correctAnswer) {
  return answer == correctAnswer;
};

var isCorrectChoice = function (q, choice) {
  return q.correctResponse == choice;
};

var buildFeedback = function (question, answer, settings, isCorrect) {
  var out = {};
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

var calculateScore = function (question, answer) {
  return question.correctResponse == answer ? 1.0 : 0.0;
};

/*
 Create a response to the answer based on the question, the answer and the respond settings
 */


exports.respond = function (question, answer, settings) {
  var answerIsCorrect, response;

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }
  answerIsCorrect = this.isCorrect(answer, question.correctResponse);
  response = {
    correctness:  answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer)
  };
  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings, answerIsCorrect);
  }

  return response;
};
