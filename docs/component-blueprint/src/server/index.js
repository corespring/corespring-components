var _ = require('lodash');

var fb = require('corespring.server-shared.server.feedback-utils');

exports.keys = fb.keys;
exports.createOutcome = createOutcome;


function createOutcome(question, answer, settings) {
  var numAnswers = countNumberOfAnswers(answer);
  var numCorrectAnswers = countNumberOfCorrectAnswers(question, answer);
  var numTotalCorrectAnswers = countNumberOfExpectedAnswers(question);

  var response = fb.defaultCreateOutcome(question, answer, settings,
    numAnswers, numCorrectAnswers, numTotalCorrectAnswers);

  /*
  response.numAnswers = numAnswers;
  response.numCorrectAnswers = numCorrectAnswers;
  response.numTotalCorrectAnswers = numTotalCorrectAnswers;
  */
  response.detailedFeedback = createDetailedFeedback(question, answer);
  return response;
}

/**
 * answers = {
 *  cat_1:[choice-1, choice-2],
 *  cat_2:[choice-3]
 *  }
 */
function countNumberOfAnswers(answers) {
  return _.reduce(answers, function(sum, cat){
    return sum + cat.length;
  }, 0);
}

/**
 * answers = {
 *  cat_1:[choice-1, choice-2],
 *  cat_2:[choice-3]
 *  }
 * correctResponse = {
 *  cat_1:[choice-1, choice-2],
 *  cat_2:[choice-3]
 *  }
 *  TODO If partialScoring is allowed,
 *  what happens if the user drops all
 *  choices into all categories?
 */
function countNumberOfCorrectAnswers(question, answers) {
  return _.reduce(answers, function(totalSum, cat, catId){
    return totalSum + _.reduce(cat, function(sumPerCategory, answer){
      return sumPerCategory + (_.contains(question.correctResponse[catId], answer) ? 1 : 0)
    }, 0)
  }, 0);
}

/**
 * correctResponse = {
 *  cat_1:[choice-1, choice-2],
 *  cat_2:[choice-3]
 *  }
 */
function countNumberOfExpectedAnswers(question) {
  return _.reduce(question.correctResponse, function(sum, cat){
    return sum + cat.length;
  }, 0);
}

/**
 * create feedback for every category and every answer
 */
function createDetailedFeedback(question, answer) {
  var returnValue = {};
  answer = answer || {};
  _.forEach(question.model.categories, function(cat){
    returnValue[cat.id] = feedbackForCategory(question.correctResponse[cat.id], answer[cat.id])
  });
  return returnValue;

  function feedbackForCategory(correctAnswers, actualAnswers){
    var returnValue = {};
    if(correctAnswers && correctAnswers.length > 0){
      if(!actualAnswers || actualAnswers.length < correctAnswers.length){
        returnValue.answerExpected = true;
      }
      if(actualAnswers && actualAnswers.length > 0){
        var correctAnswersCopy = _.clone(correctAnswers);
        returnValue.feedback = _.map(actualAnswers, function(answer){
          var index = _.indexOf(correctAnswersCopy, answer);
          if(index >= 0){
            correctAnswersCopy.splice(index,1);
            return 'correct';
          }
          return 'incorrect';
        });
      }
    }
    return returnValue;
  }
}

