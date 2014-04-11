var _ = require('lodash');

exports.respond = function(question, answer, settings) {
  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var response = {
  };

  if (settings.showFeedback) {
    var fb = question.feedback || {feedbackType: "default"};
    var feedbackType = fb.feedbackType || "default";
    if (feedbackType === "custom") {
      response.feedback = question.feedback.feedback;
    } else if (feedbackType === "default") {
      response.feedback = "Your answer has been submitted";
    }
  }

  return response;
};
