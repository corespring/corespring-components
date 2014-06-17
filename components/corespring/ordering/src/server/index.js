var _ = require('lodash');

exports.DEFAULT_CORRECT_FEEDBACK = "Correct!";
exports.DEFAULT_PARTIAL_FEEDBACK = "Almost!";
exports.DEFAULT_INCORRECT_FEEDBACK = "Good try but that is not the correct answer.";

exports.respond = function(question, answer, settings) {

  function correctness() {
    if (_.isEqual(question.model.correctResponse, answer)) {
      return 'correct';
    } else {
      return question.allowPartialScoring && _.find(_.zip(question.model.correctResponse, answer), function(pair) {
        return pair[0] === pair[1];
      }) ? 'partial' : 'incorrect';
    }
  }

  function feedbackMessage() {
    var defaults = {
      correct: exports.DEFAULT_CORRECT_FEEDBACK,
      partial: exports.DEFAULT_PARTIAL_FEEDBACK,
      incorrect: exports.DEFAULT_INCORRECT_FEEDBACK
    };

    var feedbackObject = question.model.feedback[correctness()];
    if (feedbackObject.feedbackType === 'custom') {
      return feedbackObject.notChosenFeedback;
    } else if (feedbackObject.feedbackType === 'none') {
      return undefined;
    } else {
      return defaults[correctness()];
    }
  }

  var buildFeedback = function() {
    var feedback = {
      responses: {},
      correctness: correctness()
    };

    for (var i = 0; i < question.model.correctResponse.length; i++) {
      var isCorrect = answer.length >= i && question.model.correctResponse[i] === answer[i];
      feedback.responses[question.model.correctResponse[i]] = {
        correct: isCorrect
      };
    }

    if (feedbackMessage()) {
      feedback.message = feedbackMessage();
    }

    if (!_.isEmpty(question.comments)) {
      feedback.comments = question.comments;
    }

    return feedback;
  };

  var response = {
    correctness: correctness(),
    score: (correctness() === 'correct') ? 1 : 0,
    answer: answer
  };

  if (settings.showFeedback) {
    response.feedback = buildFeedback();
  }

  return response;
};
