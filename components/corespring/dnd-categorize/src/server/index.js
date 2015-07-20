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
    if(isPartiallyCorrect && question.allowPartialScoring){
      evaluatePartialScoringSections(question, answer);
      return calcMultiSectionPartialScoring(question) / 100;
    }
    return 0;
  }
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

//Update the sections with the results & weight per section
function evaluatePartialScoringSections(question, answer) {
  answer = answer || {};
  _.forEach(question.partialScoring.sections, function(section) {
    var catId = section.catId;
    var answers = answer[catId] || [];
    var correctResponses = question.correctResponse[catId];

    section.weight = getWeight(question, catId);
    section.numAnswers = answers.length;
    section.numberOfCorrectResponses = correctResponses.length;
    section.numAnsweredCorrectly = countCorrectAnswersInCategory(correctResponses, answers);
  });
}

function getWeight(question, catId){
  if(!question.allowWeighting){
    return 1;
  }

  var catWeight = question.weighting[catId] * 1;
  catWeight = isNaN(catWeight) ? 1 : catWeight;
  return catWeight;
}

/**
 * Calculate the score of every section and return the weighted average
 * If weighting is not allowed or equally distributed, the result will
 * be the same as the normal partial scoring. The simplest case ist
 * weight = 1 for all sections and so totalWeight = number of sections
 * @returns {number}
 */
function calcMultiSectionPartialScoring(question) {
  var sections = question.partialScoring.sections;
  var numberOfSections = sections.length;
  if (numberOfSections === 0) {
    return 0;
  }
  var totalWeight = _.reduce(question.model.categories, function(acc,cat){
    var weight = getWeight(question, cat.id);
    return acc + weight;
  }, 0);
  var sumOfScores = _.reduce(sections, function(acc, section) {
    return acc + calcSectionScore(section);
  }, 0);
  return sumOfScores / totalWeight;
}

function calcSectionScore(section) {
  var isCorrect = section.numAnswers === section.numAnsweredCorrectly &&
    section.numAnsweredCorrectly === section.numberOfCorrectResponses;
  var isPartiallyCorrect = !isCorrect && section.numAnsweredCorrectly > 0;
  var score = 0;
  if (isCorrect) {
    score = 100;
  } else if (isPartiallyCorrect) {
    score = calcPartialScoring(section.partialScoring, section.numAnsweredCorrectly);
  }
  var weight = isNaN(section.weight) ? 0 : section.weight;
  return score * weight;
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

