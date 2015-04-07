/**
 * This is corespring-match server side logic
 */

var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');
var keys = feedbackUtils.keys;

exports.keys = keys;
exports.createOutcome = createOutcome;

//---------------------------------------------------------

var ALL_CORRECT = "all_correct";
var SOME_CORRECT = "some_correct";
var ALL_INCORRECT = "all_incorrect";
var WARNING = "warning";

function createOutcome(question, answer, settings) {
  settings = settings || {};

  var response = {
    correctness: ALL_INCORRECT,
    correctResponse: question.correctResponse,
    score: 0,
    feedback:{},
    correctnessMatrix: buildCorrectnessMatrix(question, answer, settings)
  };

  if (numberOfAnswers(answer) === 0) {
    response = addOptionalParts(response);
    response.correctness = WARNING;
    response.feedback.summary = feedbackUtils.makeFeedback(question.feedback, WARNING);
    return response;
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  response.correctness = getCorrectnessString(answer, question.correctResponse);
  response.score = calculateScore(question, answer);
  return addOptionalParts(response);

  function addOptionalParts(response) {
    if (settings.showFeedback) {
      response.feedback.summary = buildFeedbackSummary(question, response.correctness);
    }
    if (question.comments) {
      response.comments = question.comments;
    }
    return response;
  }
}

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
    //do we ever get here?
    return null;
  }
}

function buildCorrectnessMatrix(question, answer, settings) {
  var matrix = question.correctResponse.map(validateRow);
  return matrix;

  function validateRow(correctRow) {
    var answerRow = _.find(answer, whereIdIsEqual(correctRow.id));
    if(!answerRow){
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
    if(answerExpected){
      returnValue.answerExpected = true;
    }

    return returnValue;
  }
}

function buildFeedbackSummary(question, correctness) {
  var feedback = (question && question.feedback && question.feedback[correctness]);

  if(feedback) {
    if (feedback.type === 'none') {
      return null;
    }
    if (feedback.type !== 'default' && !_.isEmpty(feedback.text)) {
      return feedback.text;
    }
  }
  switch(correctness){
    case ALL_CORRECT: return keys.DEFAULT_CORRECT_FEEDBACK;
    case SOME_CORRECT: return keys.DEFAULT_PARTIAL_FEEDBACK;
    default: return keys.DEFAULT_INCORRECT_FEEDBACK;
  }
}

function calculateScore(question, answer) {

  var maxCorrect = countCorrectAnswers(question.correctResponse, question.correctResponse);
  var correctCount = countCorrectAnswers(answer, question.correctResponse);

  if (correctCount === maxCorrect) {
    return 1;
  }

  if (maxCorrect > 1 && question.allowPartialScoring) {
    return calculatePartialScore() / 100;
  }

  return 0;


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

  // Either return scores from the question or create evenly distributed scores
  function getPartialScores() {
    if (question.partialScores) {
      var validationResult = validateScoreDefinition(question);

      if (validationResult.valid) {
        return question.partialScores;
      } else {
        if (window.console) {
          _.forEach(validationResult.errors, function (error) {
            console.error(error);
          });
        }
        return null;
      }
    } else {
      var evenlyDistributedScore = 100 / question.correctResponse.length;
      var scoreDefinitions = _.reduce(question.correctResponse, function (acc, row) {
        acc[row.id] = evenlyDistributedScore;
        return acc;
      }, {});
      return scoreDefinitions;
    }
  }

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
}

function makeEmptyAnswerRow(correctRow){
  var answerRow = _.cloneDeep(correctRow);
  answerRow.matchSet = _.map(answerRow.matchSet, function(){
    return false;
  });
  return answerRow;
}

function numberOfAnswers(answer){
  if(!answer){
    return 0;
  }
  var sum = _.reduce(answer, function(sum, row){
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
    return acc1 + _.reduce(zippedMatchSet, countWhenTrueAndCorrect, 0);
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

function countTrueValues(arr){
  return _.reduce(arr, countWhenTrue, 0);
}

