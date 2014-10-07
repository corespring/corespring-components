var _ = require('lodash');

function getFeedback(question) {
  var fb = question.feedback || {feedbackType: "default"};
  var feedbackType = fb.feedbackType || "default";
  if (feedbackType === "custom") {
    return question.feedback.feedback;
  } else if (feedbackType === "default") {
    return "<b>Submitted Successfully.</b> Your answer was submitted.";
  }
}

exports.feedback = {
  NO_ANSWER: 'Please submit your answer to the question above.'
};

exports.respond = function(question, answer, settings) {

  if (!answer) {
    return {
      correctness: 'incorrect',
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
