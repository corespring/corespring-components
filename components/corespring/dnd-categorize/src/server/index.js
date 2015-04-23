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

  response.specificFeedback = createSpecificFeedback(question, answer);
  return response;
}

function countAnswers(answers) {
  if (!answers) {
    return 0;
  }
  return _.reduce(answers, function(sum, cat) {
    return sum + cat.length;
  });
}

function countCorrectAnswers(question, answers) {
  if (!answers) {
    return 0;
  }
  return _.reduce(question.model.categories, function(sum, cat) {
    return sum + countCorrectAnswersInCategory(question.correctResponse[cat.id], answers[cat.id]);
  });
}

function countExpectedAnswers(question) {
  return _.reduce(question.correctResponse, function(sum, cat) {
    return sum + cat.length;
  });
}

function countCorrectAnswersInCategory(correctAnswers, answers) {
  var copyOfCorrect = _.cloneDeep(correctAnswers);
  return _.reduce(answers, function(sum, answer) {
    var index = _.indexOf(copyOfCorrect, answer);
    if (index >= 0) {
      copyOfCorrect.splice(index, 1);
      return sum + 1;
    }
    return sum;
  });
}

function createSpecificFeedback(question, answers) {
  return _.reduce(question.model.categories, function(result, category) {
    result[category.id] = makeFeedbackForCategory(category.id);
    return result;
  }, {});

  function makeFeedbackForCategory(catId) {
    var correctChoices = question.correctResponse[catId];
    var selectedAnswers = answers[catId];
    var feedback = {};
    if (selectedAnswers.length === 0) {
      feedback.answersExpected = correctChoices.length > 0;
    } else {
      feedback.correctness = _.map(selectedAnswers, function(answer) {
        return _.contains(correctChoices, answer) ? 'correct' : 'incorrect';
      });
    }
    return feedback;
  }

}