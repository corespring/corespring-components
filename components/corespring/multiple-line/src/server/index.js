var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");
var fb = require('corespring.server-shared.server.feedback-utils');

exports.isScoreable = function(question, answer, outcome) {
  if(!question || !question.model || !question.model.config){
    return true;
  }

  return !question.model.config.exhibitOnly;
};

exports.isCorrect = function(answer, correctResponse) {
  return countAnsweredCorrectly(answer, correctResponse) === correctResponse.length;
};

exports.isPartiallyCorrect = function(answer, correctResponse) {
  var correctAnswers = countAnsweredCorrectly(answer, correctResponse);
  return correctAnswers > 0 && correctAnswers < correctResponse.length;
};

var countAnsweredCorrectly = function(answer, correctResponse) {
  var options = {};
  options.variable = (correctResponse.vars && correctResponse.vars.split(",")[0]) || 'x';
  options.sigfigs = correctResponse.sigfigs || 3;

  var sum = _.reduce(answer, function(sum, a, index) {
    var isCorrect = (a.equation) ? functionUtils.isFunctionEqual(a.equation, correctResponse[index].equation, options) : false;
    var newsum = sum + (isCorrect ? 1 : 0);
    return newsum;
  }, 0);
  return sum;
};

var calculateScore = function(answer, question) {

  var correctAnswerCount = countAnsweredCorrectly(answer, question.correctResponse);
  var definedAsCorrect = question.correctResponse.length;

  var calculatePartialScore = function(correctCount) {
    var partialScore = _.find(question.partialScoring, function(ps) {
      return ps.numberOfCorrect === correctCount;
    });

    return _.isUndefined(partialScore) ? 0 : partialScore.scorePercentage;
  };

  if (correctAnswerCount === 0) {
    return 0;
  }

  if (correctAnswerCount === definedAsCorrect) {
    return 1;
  }

  if (definedAsCorrect > 1 && question.allowPartialScoring) {
    return calculatePartialScore(correctAnswerCount) / 100;
  } else {
    return (correctAnswerCount === definedAsCorrect) ? 1 : 0;
  }
}

exports.createOutcome = function(question, answer, settings) {

  var countAnsweredGiven = function(answer) {
    var answersGiven = 0;
    _.each(answer, function(line){
      if(line.equation !== undefined && line.equation !== null && line.equation !== "") {
        answersGiven++;
      }
    });
    return answersGiven;
  }

  function validAnswer(answer) {
    return answer !== undefined && answer !== null;
  }

  if (!question || _.isEmpty(question)){
    throw new Error('question should never be empty or null');
  }

  if (question.model && question.model.config && question.model.config.exhibitOnly) {
    console.log('exhibit only don\'t process');
    return {
      correctness: 'n/a',
      score: 0
    };
  }

  var addFeedback = (settings.showFeedback && question.model && question.model.config && !question.model.config.exhibitOnly);

  // check for invalid or empty answers
  var answerGivenCount = countAnsweredGiven(answer);
  if (!validAnswer(answer) || answerGivenCount === 0) {

    var answerCorrectness = (answerGivenCount === 0) ? 'warning' : 'incorrect';
    return {
      correctness: answerCorrectness,
      score: 0,
      feedback: addFeedback ? fb.makeFeedback(question.feedback, answerCorrectness) : null
    };
  }

  var correctResponse = question.correctResponse;
  var isCorrect = exports.isCorrect(answer, _.cloneDeep(question.correctResponse));
  var isPartiallyCorrect = exports.isPartiallyCorrect(answer, _.cloneDeep(question.correctResponse));
  var response = {};

  if (!question.model.config.exhibitOnly) {
    response = {
      correctness: isCorrect ? "correct" : isPartiallyCorrect ? "partial" : "incorrect",
      score: calculateScore(answer, question),
      correctClass: fb.correctness(isCorrect, isPartiallyCorrect),
      correctResponse: _.map(correctResponse, function(line){
        return {
          label: line.label,
          equation: line.equation,
          expression: functionUtils.expressionize(line.equation, 'x')
        };
      })
    };
  }

  if (addFeedback) {
    response.feedback = fb.makeFeedback(question.feedback, fb.correctness(isCorrect, isPartiallyCorrect));
  }

  return response;
};
