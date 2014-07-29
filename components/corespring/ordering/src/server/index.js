var _ = require('lodash');

var keys = require('corespring.server-shared.feedback-utils').keys;

exports.feedbackMessage = function(question, correctness) {
  var defaults = {
    correct: keys.DEFAULT_CORRECT_FEEDBACK,
    partial: keys.DEFAULT_PARTIAL_FEEDBACK,
    incorrect: keys.DEFAULT_INCORRECT_FEEDBACK
  };

  var feedbackObject = (question.model && question.model.feedback) ? question.model.feedback[correctness] : null;
  if (feedbackObject) {
    if (feedbackObject.feedbackType === 'custom') {
      //TODO: Why is this called 'notChosenFeedback' ? it may have been chosen
      return feedbackObject.notChosenFeedback;
    } else if (feedbackObject.feedbackType === 'none') {
      return undefined;
    } else {
      return defaults[correctness];
    }
  } else {
    return defaults[correctness];
  }
};


exports.buildFeedback = function(question, answer, correctness) {
  var feedback = {
    responses: {},
    correctness: correctness
  };

  for (var i = 0; i < question.model.correctResponse.length; i++) {
    var isCorrect = (answer && answer.length >= i && question.model.correctResponse[i] === answer[i]) ? true : false;
    feedback.responses[question.model.correctResponse[i]] = {
      correct: isCorrect
    };
  }

  var feedbackMsg = exports.feedbackMessage(question, correctness);

  if (feedbackMsg) {
    feedback.message = feedbackMsg;
  }

  if (!_.isEmpty(question.comments)) {
    feedback.comments = question.comments;
  }

  return feedback;
};

exports.respond = function(question, answer, settings) {

  if(!question || _.isEmpty(question)){
    throw new Error('question should never be empty or null');
  }

  if (!answer) {
    return {
      correctness: 'incorrect',
      score: 0,
      answer: answer,
      feedback: settings.showFeedback ? exports.buildFeedback(question, answer, 'incorrect') : null
    };
  }

  function correctness() {
    if (_.isEqual(question.model.correctResponse, answer)) {
      return 'correct';
    } else {
      return (question.allowPartialScoring && correctCount() !== 0) ? 'partial' : 'incorrect';
    }
  }

  function correctCount() {
    return _.filter(_.zip(question.model.correctResponse, answer), function(pair) {
      return pair[0] === pair[1];
    }).length;
  }

  function partialScore() {
    var partial = _.find(question.partialScoring, function(partialScoring) {
      return partialScoring.numberOfCorrect === correctCount();
    });
    return partial ? partial.scorePercentage / 100 : 0;
  }


  var response = {
    correctness: correctness(),
    score: (correctness() === 'correct') ? 1 : (question.allowPartialScoring ? partialScore() : 0),
    answer: answer
  };

  if (settings.showFeedback) {
    response.feedback = exports.buildFeedback(question, answer, correctness());
  }

  return response;
};