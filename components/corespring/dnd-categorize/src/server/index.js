var _ = require('lodash');

var fb = require('corespring.server-shared.server.feedback-utils');

exports.keys = fb.keys;
exports.createOutcome = createOutcome;

//---------------------------------------------

function createOutcome(question, answer, settings) {
  var numberOfAnswers = countAnswers(answer);
  var numberOfCorrectAnswers = countCorrectAnswers(question, answer);
  var numberOfExpectedAnswers = countExpectedAnswers(question);

  var response = fb.defaultCreateOutcome(question, answer, settings,
    numberOfAnswers, numberOfCorrectAnswers, numberOfExpectedAnswers);

  response.detailedFeedback = createDetailedFeedback(question, answer);
  return response;
}

function countAnswers(answers) {
  if (!answers) {
    return 0;
  }
  return _.reduce(answers, function(sum, cat) {
    return sum + cat.length;
  }, 0);
}

function countCorrectAnswers(question, answers) {
  if (!answers) {
    return 0;
  }
  return _.reduce(question.correctResponse, function(sum, expectedAnswers, categoryId) {
    return sum + countCorrectAnswersInCategory( expectedAnswers, answers[categoryId]);
  }, 0);
}

function countExpectedAnswers(question) {
  return _.reduce(question.correctResponse, function(sum, cat) {
    return sum + cat.length;
  }, 0);
}

function countCorrectAnswersInCategory(expectedAnswers, answers) {
  var copyOfExpectedAnswers = _.cloneDeep(expectedAnswers);
  return _.reduce(answers, function(sum, answer) {
    var index = _.indexOf(copyOfExpectedAnswers, answer);
    if (index >= 0) {
      copyOfExpectedAnswers.splice(index, 1);
      return sum + 1;
    }
    return sum;
  }, 0);
}

function createDetailedFeedback(question, answers) {
  return _.reduce(question.correctResponse, function(result, expectedAnswers, categoryId) {
    result[categoryId] = makeFeedbackForCategory(expectedAnswers, categoryId);
    return result;
  }, {});

  function makeFeedbackForCategory(expectedAnswers, catId) {
    var selectedAnswers = answers[catId];
    var feedback = {};
    if (selectedAnswers.length === 0) {
      feedback.answersExpected = expectedAnswers.length > 0;
    } else {
      feedback.correctness = _.map(selectedAnswers, function(answer) {
        return _.contains(expectedAnswers, answer) ? 'correct' : 'incorrect';
      });
    }
    return feedback;
  }

}