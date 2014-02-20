var _ = require('lodash');

exports.render = function(element) {
  return element;
};

exports.isCorrect = function() {
  return true;
};

exports.respond = function(model, answer, settings, targetOutcome) {

  if (!settings.showFeedback) {
    return {};
  }

  var isCorrect;
  var feedback;

  var correctFeedback = model.feedback.correct || {};
  var incorrectFeedback = model.feedback.incorrect || {};

  feedback = correctFeedback[targetOutcome.studentResponse];
  if (feedback) {
    isCorrect = true;
  } else {
    feedback = incorrectFeedback[targetOutcome.studentResponse];
    isCorrect = false;
  }

  if (!feedback) {
    isCorrect = targetOutcome.correctness === "correct";
    feedback = (isCorrect ? correctFeedback["*"] : incorrectFeedback["*"]);
  }

  if (targetOutcome.outcome) {
    var outcome = targetOutcome.outcome;
    var feedbackForOutcome = _.find(outcome, function(o) {
      return model.feedback.outcome && !_.isUndefined(model.feedback.outcome[o]);
    });
    if (feedbackForOutcome) {
      var modelOutcome = model.feedback.outcome && model.feedback.outcome[feedbackForOutcome];
      if (modelOutcome) {
        feedback = modelOutcome.text;
        isCorrect = modelOutcome.correct;
      }
    }
  }

  var response = {
    correctness: isCorrect ? "correct" : "incorrect",
    feedback: feedback
  };

  return response;
};
