/**
 * This is corespring-match server side logic
 */

var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');
var keys = feedbackUtils.keys;

exports.keys = keys;
exports.createOutcome = createOutcome;

//---------------------------------------------------------

function createOutcome(question, answer, settings) {
  settings = settings || {};

  var response = {
    correctness: 'all_incorrect',
    correctResponse: question.correctResponse,
    score: 0
  };

  function addOptionalParts(response) {
    if (settings.showFeedback) {
      response.feedback = {
        summary: buildFeedbackSummary(question, response.correctness)
      };
      if (answer) {
        response.feedback.correctnessMatrix = buildCorrectnessMatrix(question, answer, settings);
      }
      if (question.summaryFeedback) {
        response.summaryFeedback = question.summaryFeedback;
      }
    }
    if (question.comments) {
      response.comments = question.comments;
    }
    return response;
  }

  if (!answer) {
    return addOptionalParts(response);
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  response.correctness = getCorrectnessString(answer, question.correctResponse);
  response.score = calculateScore(question, answer);
  return addOptionalParts(response);
}

function countCorrectAnswers(answer, correctAnswer) {
  return _.reduce(answer, function(acc1, answerRow) {
    var correctMatchSet = _.find(correctAnswer, function(correctRow) {
      return correctRow.id === answerRow.id;
    }).matchSet;

    var zippedMatchSet = _.zip(correctMatchSet, answerRow.matchSet);

    return acc1 + _.reduce(zippedMatchSet, function(acc2, pair) {
      var correctMatch = pair[0];
      var answeredMatch = pair[1];
      return acc2 + (correctMatch && answeredMatch ? 1 : 0);
    }, 0);
  }, 0);
}

var ALL_CORRECT = "all_correct";
var SOME_CORRECT = "some_correct";
var ALL_INCORRECT = "all_incorrect";

function getCorrectnessString(answer, correctAnswer) {

  var numAnsweredCorrectly = countCorrectAnswers(answer, correctAnswer);

  var totalCorrectAnswers = countCorrectAnswers(correctAnswer, correctAnswer);

  if (totalCorrectAnswers === numAnsweredCorrectly) {
    return ALL_CORRECT;
  } else if (numAnsweredCorrectly === 0) {
    return ALL_INCORRECT;
  } else if (numAnsweredCorrectly < totalCorrectAnswers) {
    return SOME_CORRECT;
  } else {
    return null;
  }
}

function whereIdIsEqual(id) {
  return function(match) {
    return match.id === id;
  };
}

function buildCorrectnessMatrix(question, answer, settings) {
  var matrix = question.correctResponse.map(function(correctRow) {
    var answerRow = _.find(answer, whereIdIsEqual(correctRow.id));
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
        "correctness": correctness,
        "value": answeredMatch
      };
    });

    var returnValue = {
      id: correctRow.id,
      matchSet: matchSet
    };

    function countTrueValues(arr){
      return _.reduce(arr, function(sum, value){
        console.log("value", value);
        return sum += (value ? 1 : 0);
      });
    }

    var numberOfExpectedAnswers = countTrueValues(correctRow.matchSet);
    var numberOfActualAnswers = countTrueValues(answerRow.matchSet);
    var answerExpected = numberOfExpectedAnswers > 0 && numberOfActualAnswers === 0;
    if(answerExpected){
      returnValue.answerExpected = true;
    }

    return returnValue;
  });

  return matrix;
}

var defaultFeedbackTable = {};
defaultFeedbackTable[ALL_CORRECT] = keys.DEFAULT_CORRECT_FEEDBACK;
defaultFeedbackTable[ALL_INCORRECT] = keys.DEFAULT_INCORRECT_FEEDBACK;
defaultFeedbackTable[SOME_CORRECT] = keys.DEFAULT_PARTIAL_FEEDBACK;

function buildFeedbackSummary(question, correctness) {
  var feedback = (question && question.feedback && question.feedback[correctness]);

  if (!feedback || !feedback.type || feedback.type.length === 0 || feedback.type === 'none') {
    return null;
  }
  if (feedback.type === 'default') {
    return defaultFeedbackTable[correctness];
  }
  if (feedback.text && feedback.text.length > 0) {
    return feedback.text;
  }

  return defaultFeedbackTable[correctness];
}

function calculateScore(question, answer) {

  function countWhenTrue(acc, bool) {
    return acc + (bool ? 1 : 0);
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

  function getPartialScores() {

    function validateScoreDefinition() {
      var result = {
        valid: false,
        errors: []
      };

      var validation = _.reduce(question.correctResponse, function(acc, row) {
        if (_.isNumber(question.partialScores[row.id])) {
          acc.hasAllDefs = acc.hasAllDefs && true;
          acc.scoreSumm = acc.scoreSumm + question.partialScores[row.id];
        } else {
          acc.hasAllDefs = false;
        }
        return acc;
      }, {
        hasAllDefs: true,
        scoreSumm: 0
      });

      if (validation.hasAllDefs && validation.scoreSumm === 100) {
        result.valid = true;
      }

      if (!validation.hasAllDefs) {
        result.valid = false;
        result.errors.push("number partialScores in match component should be the same as number of rows");
      }

      if (validation.scoreSumm !== 100) {
        result.valid = false;
        result.errors.push("The summary of all partial scores should be equal to 100");
      }

      return result;
    }

    // Either return scores from the question or create evenly distributed scores
    if (question.partialScores) {
      var validationResult = validateScoreDefinition(question);

      if (validationResult.valid) {
        return question.partialScores;
      } else {
        if (console) {
          _.forEach(validationResult.errors, function(error) {
            console.error(error);
          });
        }
        return null;
      }
    } else {
      var evenScoreDistribution = 100 / question.correctResponse.length;
      var scoreDefinitions = _.reduce(question.correctResponse, function(acc, row) {
        acc[row.id] = evenScoreDistribution;
        return acc;
      }, {});
      return scoreDefinitions;
    }
  }

  function calculatePartialScore() {

    var partialScores = getPartialScores(question);

    if (!partialScores) {
      return undefined;
    }

    var partialScore = _.reduce(answer, function(acc, answerRow) {

      var rowScore = partialScores[answerRow.id];
      var correctMatchSet = _.find(question.correctResponse, whereIdIsEqual(answerRow.id)).matchSet;
      var zippedMatchSet = _.zip(correctMatchSet, answerRow.matchSet);

      var totalCorrectAnswers = _.reduce(correctMatchSet, countWhenTrue, 0);

      if (totalCorrectAnswers === 0) {
        return acc;
      }

      var answeredTrueAndCorrectly = _.reduce(zippedMatchSet, countWhenTrueAndCorrect, 0);

      var answeredIncorrectly = _.reduce(zippedMatchSet, countIncorrect, 0);

      return acc + ((rowScore / (totalCorrectAnswers + answeredIncorrectly)) * answeredTrueAndCorrectly);
    }, 0);
    return partialScore;
  }

  var maxCorrect = countCorrectAnswers(question.correctResponse, question.correctResponse);
  var correctCount = countCorrectAnswers(answer, question.correctResponse);

  if (correctCount === 0) {
    return 0;
  }

  if (correctCount === maxCorrect) {
    return 1;
  }

  if (maxCorrect > 1 && question.allowPartialScoring) {
    return calculatePartialScore() / 100;
  } else if (correctCount < maxCorrect) {
    return 0;
  }
}