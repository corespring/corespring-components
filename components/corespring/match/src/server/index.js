/**
 * This is corespring-match server side logic
 */

var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');

exports.keys = feedbackUtils.keys;
exports.createOutcome = createOutcome;
exports.legacyScore = legacyScore;

//---------------------------------------------------------

var CORRECT = "correct";
var PARTIAL = "partial";
var INCORRECT = "incorrect";
var WARNING = "warning";

function createOutcome(question, answer, settings) {
  var numAnswers = numberOfAnswers(answer);
  var numAnsweredCorrectly = countCorrectAnswers(answer, question.correctResponse);
  var totalCorrectAnswers = countCorrectAnswers(question.correctResponse, question.correctResponse);

  var response = feedbackUtils.defaultCreateOutcome(question, answer, settings,
    numAnswers, numAnsweredCorrectly, totalCorrectAnswers);

  if (question.model.config && question.model.config.inputType === 'checkbox' && !_.isEmpty(question.partialScoring)) {
    amendResponseForCheckboxPartial(question, answer, response);
  }
  response.correctnessMatrix = buildCorrectnessMatrix(question, answer);
  response.correctNum = numAnsweredCorrectly;
  response.legacyScore = legacyScore(question, answer);
  return response;
}

function legacyScore(question, answer) {
  var calculatedValue, max, min;

  function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  if (question.legacyScoring && question.legacyScoring.mapping && !_.isEmpty(question.legacyScoring.mapping)) {
    calculatedValue = _(answer).map(function(studentResponse) {
      var scoring = question.legacyScoring.mapping[studentResponse.id];
      return _(studentResponse.matchSet).map(function(value, index) {
        if (value === true) {
          return scoring[index.toString()] !== undefined ? scoring[index.toString()] : question.legacyScoring.defaultValue;
        } else {
          return 0;
        }
      }).reduce(function(a, b) {
        return a + b;
      }, 0);
    }).reduce(function(a, b) {
      return a + b;
    }, 0);

    min = question.legacyScoring.lowerBound !== undefined ? question.legacyScoring.lowerBound : calculatedValue;
    max = question.legacyScoring.upperBound !== undefined ? question.legacyScoring.upperBound : calculatedValue;

    return clamp(calculatedValue, min, max);
  }
  return undefined;
}

function amendResponseForCheckboxPartial(question, answer, response) {
  var score = 0;
  var numberOfRows = question.correctResponse.length;
  _.each(question.model.rows, function(row) {
    var answerForRow = _.find(answer, whereIdIsEqual(row.id));
    var correctResponseForRow = _.find(question.correctResponse, whereIdIsEqual(row.id));
    var numberOfCorrectForRow = _.reduce(answerForRow.matchSet, function(acc, val, idx) {
      return acc + (correctResponseForRow.matchSet[idx] ? 1 : 0);
    }, 0);
    var numberOfCorrectlySelectedForRow = _.reduce(answerForRow.matchSet, function(acc, val, idx) {
      return acc + ((val === true && correctResponseForRow.matchSet[idx] === val) ? 1 : 0);
    }, 0);
    var partialScoreSection = _.findWhere(question.partialScoring.sections, {catId: row.id});
    var partialScoreForRow = partialScoreSection && _.findWhere(partialScoreSection.partialScoring, {numberOfCorrect: numberOfCorrectlySelectedForRow});
    if (numberOfCorrectlySelectedForRow === numberOfCorrectForRow) {
      score += 1 / numberOfRows;
    } else if (partialScoreForRow) {
      score += (partialScoreForRow.scorePercentage / numberOfRows) / 100;
    }
  });
  response.feedback = feedbackUtils.makeFeedback(question.feedback, 'partial');
  response.correctClass = 'partial';
  response.score = score;
}

function buildCorrectnessMatrix(question, answer) {
  var matrix = question.correctResponse.map(validateRow);
  return matrix;

  function validateRow(correctRow) {
    var answerRow = _.find(answer, whereIdIsEqual(correctRow.id));
    if (!answerRow) {
      answerRow = makeEmptyAnswerRow(correctRow);
    }
    var zippedMatchSet = _.zip(correctRow.matchSet, answerRow.matchSet);
    var matchSet = zippedMatchSet.map(function(zippedMatches) {

      var correctMatch = zippedMatches[0];
      var answeredMatch = zippedMatches[1];
      var correctness = "";

      if (answeredMatch) {
        correctness = correctMatch ? "correct" : "incorrect";
      } else {
        correctness = "unknown";
      }

      return {
        correctness: correctness,
        value: answeredMatch
      };
    });

    var returnValue = {
      id: correctRow.id,
      matchSet: matchSet
    };

    var numberOfExpectedAnswers = countTrueValues(correctRow.matchSet);
    var numberOfActualAnswers = countTrueValues(answerRow.matchSet);
    var answerExpected = numberOfExpectedAnswers > 0 && numberOfActualAnswers === 0;
    if (answerExpected) {
      returnValue.answerExpected = true;
    }

    return returnValue;
  }
}

function makeEmptyAnswerRow(correctRow) {
  var answerRow = _.cloneDeep(correctRow);
  answerRow.matchSet = _.map(answerRow.matchSet, function() {
    return false;
  });
  return answerRow;
}

function numberOfAnswers(answer) {
  if (!answer) {
    return 0;
  }
  var sum = _.reduce(answer, function(sum, row) {
    return sum + countTrueValues(row.matchSet);
  }, 0);

  return sum;
}

function whereIdIsEqual(id) {
  return function(match) {
    return match.id === id;
  };
}

function countCorrectAnswers(answer, correctAnswer) {
  return _.reduce(answer, function(acc1, answerRow) {
    var correctMatchSet = _.find(correctAnswer, function(correctRow) {
      return correctRow.id === answerRow.id;
    }).matchSet;

    var zippedMatchSet = _.zip(correctMatchSet, answerRow.matchSet);
    var numIncorrect = _.reduce(zippedMatchSet, countIncorrect, 0);
    //A row is counted only if there are no incorrect answers
    //otherwise the user could simply select every answer to get the
    //max partial scoring
    return acc1 + ((0 === numIncorrect) ?
        _.reduce(zippedMatchSet, countWhenTrueAndCorrect, 0) : 0);
  }, 0);
}

function countIncorrect(acc, correct_answer_pair) {
  var correct = correct_answer_pair[0];
  var answer = correct_answer_pair[1];
  return countWhenTrue(acc, answer && !correct);
}

function countWhenTrueAndCorrect(acc, correct_answer_pair) {
  var correct = correct_answer_pair[0];
  var answer = correct_answer_pair[1];
  return countWhenTrue(acc, answer && correct);
}

function countWhenTrue(acc, bool) {
  return acc + (bool ? 1 : 0);
}

function countTrueValues(arr) {
  return _.reduce(arr, countWhenTrue, 0);
}