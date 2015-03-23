var _ = require('lodash');

var fb = require('corespring.server-shared.server.feedback-utils');

exports.keys = fb.keys;

exports.createOutcome = function(question, answer, settings) {

  var defaults = {
    correct: exports.DEFAULT_CORRECT_FEEDBACK,
    incorrect: exports.DEFAULT_INCORRECT_FEEDBACK,
    partial: exports.DEFAULT_PARTIAL_FEEDBACK
  };

  if (!question || _.isEmpty(question)) {
    throw new Error('the question should never be null or empty');
  }

  if (!answer) {
    return {
      correctness: 'incorrect',
      score: 0,
      correctResponse: question.correctResponse,
      answer: answer,
      feedback: settings.showFeedback ? fb.makeFeedback(question.feedback, 'incorrect') : null
    };
  }

  var isCorrect = true;
  var isPartiallyCorrect = false;
  var numberOfCorrectAnswers = 0;

  for (var k in answer) {
    var correctResponseForId = question.correctResponse[k];
    if (correctResponseForId && answer[k]) {
      isCorrect &= _.isEmpty(_.xor(answer[k], correctResponseForId));
      isPartiallyCorrect |= _.xor(answer[k], correctResponseForId).length < (answer[k].length + correctResponseForId.length);
      numberOfCorrectAnswers += correctResponseForId.length - _.xor(answer[k], correctResponseForId).length;
    }
  }

  var score = 0;

  function countCorrectAnswersInCategory(correctInCategory, actualInCategory) {
    return _.reduce(correctInCategory, function(acc, choiceId) {
      var foundChoice = _.find(actualInCategory, eq(choiceId));
      if (foundChoice) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }

  function eq(str) {
    return function(object) {
      return object === str;
    };
  }

  if (isCorrect && !question.allowPartialScoring) {
    score = 1;
  } else if (question.allowPartialScoring) {

    var partialScore = _.reduce(question.partialScoring, function(acc, scenarios, categoryId) {

      var correctInCategory = question.correctResponse[categoryId];
      if (correctInCategory.length === 0) {
        return acc;
      }
      var actualInCategory = answer[categoryId];
      var numCorrectInCategory = countCorrectAnswersInCategory(correctInCategory, actualInCategory);

      var scenario = _.find(scenarios, function(scenario) {
        return scenario.numCorrectAnswers === numCorrectInCategory;
      });

      if (scenario) {
        return acc + ((numCorrectInCategory / correctInCategory.length) * (scenario.awardPercents / 100));
      }

      return acc;
    }, 0);

    score = partialScore / question.model.categories.length;
  }

  var res = {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    answer: answer,
    score: score,
    correctClass: fb.correctness(isCorrect, isPartiallyCorrect),
    comments: question.comments
  };

  if (settings.showFeedback) {
    res.feedback = fb.makeFeedback(question.feedback, fb.correctness(isCorrect, isPartiallyCorrect));
  }

  return res;
};