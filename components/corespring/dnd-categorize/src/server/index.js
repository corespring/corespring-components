var _ = require('lodash');

var fbUtils = require('corespring.server-shared.server.feedback-utils');

exports.keys = fbUtils.keys;
exports.createOutcome = createOutcome;

//---------------------------------------------

function createOutcome(question, answer, settings) {
  var numberOfAnswers = countAnswers(answer);
  var numberOfCorrectAnswers = countCorrectAnswers(question, answer);
  var numberOfExpectedAnswers = countExpectedAnswers(question);

  var response = fbUtils.defaultCreateOutcome(question, answer, settings,
    numberOfAnswers, numberOfCorrectAnswers, numberOfExpectedAnswers, calcScore);

  response.detailedFeedback = createDetailedFeedback(question, answer);
  return response;

  //---------------------------------------------------

  function calcScore(isCorrect, isPartiallyCorrect) {
    if (isCorrect) {
      //because the sum of all weights always results in 100%
      //we don't have to calculate weights, if all answers are correct
      //1 * 50% + 1 * 50% = 100%
      //1 * 10% + 1 * 90% = 100%
      return 1;
    }
    if (isPartiallyCorrect && (question.allowPartialScoring || question.allowWeighting)) {
      return calcWeightedScore(question, answer);
    }
    return 0;
  }
}

function calcWeightedScore(question, answers) {
  var totalWeight = 0;
  var sumOfWeightedScores = _.reduce(question.model.categories, function(acc, cat) {
    var catId = cat.id;
    var weight = getWeight(question, catId);
    totalWeight += weight;
    var numExpectedAnswers = question.correctResponse[catId].length;
    var numActualAnswers = answers[catId].length;
    var numCorrectAnswers = countCorrectAnswersInCategory(question.correctResponse[catId], answers[catId]);
    var isCorrect = numExpectedAnswers === numActualAnswers && numExpectedAnswers === numCorrectAnswers;
    var isPartiallyCorrect = !isCorrect && numCorrectAnswers > 0;
    var score = 0;
    if (isCorrect) {
      score = 100;
    } else if (isPartiallyCorrect) {
      var section = _.find(question.partialScoring.sections, {
        catId: catId
      });
      if(section) {
        score = calcPartialScoring(section.partialScoring, numCorrectAnswers);
      }
    }
    return acc + score * weight;
  }, 0);
  return sumOfWeightedScores / totalWeight / 100;
}

function countAnswers(answers) {
  if (!answers) {
    return 0;
  }
  return _.reduce(answers, function(sum, cat) {
    return sum + cat.length;
  }, 0);
}

function countExpectedAnswers(question) {
  return _.reduce(question.correctResponse, function(sum, cat) {
    return sum + cat.length;
  }, 0);
}

function countCorrectAnswers(question, answers) {
  if (!answers) {
    return 0;
  }
  return _.reduce(question.correctResponse, function(sum, expectedAnswers, categoryId) {
    return sum + countCorrectAnswersInCategory(expectedAnswers, answers[categoryId]);
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
  return _.reduce(question.model.categories, function(result, category) {
    var categoryId = category.id;
    var expectedAnswers = question.correctResponse[categoryId] || [];
    var actualAnswers = answers[categoryId] || [];
    result[categoryId] = makeFeedback(expectedAnswers, actualAnswers);
    return result;
  }, {});

  function makeFeedback(expectedAnswers, actualAnswers) {
    var feedback = {};
    if (actualAnswers.length === 0) {
      feedback.answersExpected = expectedAnswers.length > 0;
    } else {
      feedback.correctness = _.map(actualAnswers, function(answer) {
        return _.contains(expectedAnswers, answer) ? 'correct' : 'incorrect';
      });
    }
    return feedback;
  }
}

function getWeight(question, catId) {
  if (!question.allowWeighting) {
    return 1;
  }

  var catWeight = question.weighting[catId] * 1;
  catWeight = isNaN(catWeight) ? 1 : catWeight;
  return catWeight;
}

function calcPartialScoring(partialScoring, numAnsweredCorrectly) {
  var partialScore = findPartialScoringScenario(partialScoring, numAnsweredCorrectly);
  return partialScore ? partialScore.scorePercentage : 0;
}

function findPartialScoringScenario(scenarios, numAnsweredCorrectly) {
  var scenario = _.find(scenarios, function(ps) {
    return ps.numberOfCorrect === numAnsweredCorrectly;
  });
  return scenario;
}

