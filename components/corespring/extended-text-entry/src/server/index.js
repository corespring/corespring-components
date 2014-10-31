var _ = require('lodash');

function getFeedback(question){
  var fb = question.feedback || {feedbackType: "default"};
  var feedbackType = fb.feedbackType || "default";
  if (feedbackType === "custom") {
    return question.feedback.feedback;
  } else if (feedbackType === "default") {
    return "Your answer has been submitted";
  }
}

exports.feedback = {
  NO_ANSWER: 'No answer provided'
};

exports.respond = function(question, answer, settings) {

   if(!answer){

    return {
      correctness: 'incorrect',
      score: 0,
      feedback: settings.showFeedback ? 'No answer provided' : null
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

  return response;
};
