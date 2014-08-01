var _ = require('lodash');

exports.render = function(element) {
  return element;
};

exports.isCorrect = function() {
  return true;
};

exports.respond = function(model, answer, settings, targetOutcome) {


  if (!targetOutcome || _.isEmpty(targetOutcome)) {
    console.warn('target outcome is empty!', JSON.stringify(model));

    return {
      correctness: 'incorrect',
      feedback: {}
    };
  }

  function findFeedback(feedbacks, response) {
    var o = _.find(feedbacks, function(item) {
      return item && ((response || "").toLowerCase().replace(/ /g, "") === (item.input || "").toLowerCase().replace(/ /g, ""));
    });
    return o ? o.feedback : "";
  }

  if (!settings.showFeedback) {
    return {};
  }

  var isCorrect;
  var feedback;

  var correctFeedback = model.feedback.correct || {};
  var incorrectFeedback = model.feedback.incorrect || {};

  feedback = findFeedback(correctFeedback, targetOutcome.studentResponse);
  if (feedback) {
    isCorrect = true;
  } else {
    feedback = findFeedback(incorrectFeedback, targetOutcome.studentResponse);
    isCorrect = false;
  }

  if (!feedback) {
    isCorrect = targetOutcome.correctness === "correct";
    feedback = findFeedback(isCorrect ? correctFeedback : incorrectFeedback, "*");
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