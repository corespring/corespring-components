var _ = require('lodash');

exports.respond = function(question, answer, settings) {
  if (question && answer && question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var response = {
  };

  if (settings.showFeedback) {
    var isEmpty = _.isEmpty(answer);
    var fbSelector = isEmpty ? "noAnswer" : "isAnswer";
    var fb = (question.feedback && question.feedback[fbSelector]) || {feedbackType: "default"};
    var feedbackType = fb.feedbackType || "default";
    if (feedbackType === "custom") {
      response.feedback = question.feedback[fbSelector].feedback;
    } else if (feedbackType === "default") {
      response.feedback = isEmpty ? "DEFAULT EMPTY" : "DEFAULT SOMETHING";
    }
  }

  return response;
};
