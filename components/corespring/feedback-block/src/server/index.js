var _ = require('lodash');

exports.render = function(element) {
  return element;
};

exports.isCorrect = function() {
  return true;
};

/**
 * Override score for feedback - It never returns a score
 * as it's not scoreable.
 * @param  {[type]} model   [description]
 * @param  {[type]} answers [description]
 * @return {[type]}         [description]
 */
exports.isScoreable = function(model, answers, outcome){
  return false;
};

function lowerCaseAndTrim(s) {
  return (s || "").toLowerCase().replace(/ /g, "");
}

function feedbackForString(feedbacks, stringResponse) {
  return _.find(feedbacks, function(fb) {
    return !_.isEmpty(fb.input) && lowerCaseAndTrim(stringResponse) === lowerCaseAndTrim(fb.input);
  });
}

exports.findFeedback = function(feedbacks, response) {

  function _f() {
    if (_.isArray(response)) {
      var fbs = _(response)
                .map(feedbackForString.bind(exports, feedbacks))
                .compact()
                .value();
      return _.first(fbs);
    } else {
      return feedbackForString(feedbacks, response);
    }
  }

  var out = _f();
  return out ? out.feedback : '';
};

exports.createOutcome = function(model, answer, settings, targetOutcome) {

  if (!settings.showFeedback) {
    return {};
  }

  if (!targetOutcome || _.isEmpty(targetOutcome)) {
    console.warn('target outcome is empty!', JSON.stringify(model));
    return {
      correctness: 'incorrect',
      feedback: {}
    };
  }

  var isCorrect;
  var feedback;

  var correctFeedback = model.feedback.correct || {};
  var incorrectFeedback = model.feedback.incorrect || {};

  feedback = exports.findFeedback(correctFeedback, targetOutcome.studentResponse);
  if (feedback) {
    isCorrect = true;
  } else {
    feedback = exports.findFeedback(incorrectFeedback, targetOutcome.studentResponse);
    isCorrect = false;
  }

  if (!feedback) {
    isCorrect = targetOutcome.correctness === "correct";
    feedback = exports.findFeedback(isCorrect ? correctFeedback : incorrectFeedback, "*");
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