var _ = require('lodash');

function getFeedback(question) {
  var fb = question.feedback || {feedbackType: "default"};
  var feedbackType = fb.feedbackType || "default";
  if (feedbackType === "custom") {
    return question.feedback.feedback;
  } else if (feedbackType === "default") {
    return "Your answer was submitted.";
  }
}

exports.isScoreable = function(){
  return false;
};

exports.feedback = {
  NO_ANSWER: 'You did not enter a response'
};

exports.createOutcome = function(question, answer, settings) {

  if (!answer) {
    return {
      correctness: 'incorrect',
      correctClass: 'nothing-submitted',
      score: 0,
      feedback: settings.showFeedback ? exports.feedback.NO_ANSWER : null
    };
  }

  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var response = {
  };

  if (settings.showFeedback) {
    response.feedback = getFeedback(question);
  }
  response.comments = question.comments;

  return response;
};
