var _ = require('lodash');

var DEFAULT_CORRECT_FEEDBACK = "Correct!";
var DEFAULT_INCORRECT_FEEDBACK = "Good try but that is not the correct answer";

exports.defaultFeedbacks = {
  correct: DEFAULT_CORRECT_FEEDBACK,
  incorrect: DEFAULT_INCORRECT_FEEDBACK
};

var feedbackByValue = function(q, v) {
  return _.find(q.feedback, function(f) {
    return f.value === v;
  });
};

var userResponseFeedback = function(fbArray, q, answer) {
  var fb, userChoice, _i, _len, _results;
  userChoice = answer;
  fb = feedbackByValue(q, userChoice);
  if (fb) {
    fb.correct = isCorrectChoice(q, userChoice);

    if (fb.feedbackType === 'default') {
      fb.feedback = fb.correct ? DEFAULT_CORRECT_FEEDBACK : DEFAULT_INCORRECT_FEEDBACK;
    } else if (fb.feedbackType === 'none') {
      delete fb.feedback;
    }
    delete fb.value;
    fbArray[userChoice] = fb;
  }
};

exports.isCorrect = function(answer, correctAnswer) {
  return answer === correctAnswer;
};

var isCorrectChoice = function(q, choice) {
  return q.correctResponse === choice;
};

var buildFeedback = function(question, answer, settings, isCorrect) {
  var out = {};
  if (settings.highlightUserResponse) {
    userResponseFeedback(out, question, answer);
  }
  return out;
};

var calculateScore = function(question, answer) {
  return question.correctResponse === answer ? 1.0 : 0.0;
};

/*
 Create a response to the answer based on the question, the answer and the respond settings
 */


exports.respond = function(question, answer, settings) {
  var answerIsCorrect, response;

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }
  answerIsCorrect = this.isCorrect(answer, question.correctResponse);
  response = {
    correctness: answerIsCorrect ? "correct" : "incorrect",
    score: calculateScore(question, answer)
  };
  if (settings.showFeedback) {
    response.feedback = buildFeedback(question, answer, settings, answerIsCorrect);
  }

  return response;
};
