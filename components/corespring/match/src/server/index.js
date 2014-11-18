/**
 * This is corespring-match server side logic
 */

var _ = require('lodash');
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');
var keys = feedbackUtils.keys;

exports.keys = keys;

exports.preprocess = function(json) {
  return json;
};

exports.isCorrect = function(answer, correctAnswer) {
  return _.reduce(answer,function(acc, answerRow) {
    var correctMatchSet = _.find(correctAnswer, function(correctRow){
      return correctRow.id === answerRow.id;
      }).matchSet;

    return acc && _.isEqual(answerRow.matchSet,correctMatchSet);
  }, true);
};

function countCorrectAnswers (answer, correctAnswer) {
  return _.reduce(answer,function(acc, answerRow) {
    var correctMatchSet = _.find(correctAnswer, function(correctRow){
      return correctRow.id === answerRow.id;
    }).matchSet;
    return acc + (_.isEqual(answerRow.matchSet,correctMatchSet) ? 1 : 0);
  }, 0);
}

var ALL_CORRECT = "all_correct";
var SOME_CORRECT = "some_correct";
var ALL_INCORRECT = "all_incorrect";

function getCorrectnessString(answer, correctAnswer) {
  var numAnsweredCorrectly = countCorrectAnswers(answer, correctAnswer);

  if (correctAnswer.length === numAnsweredCorrectly){
    return ALL_CORRECT;
  }else if(numAnsweredCorrectly === 0){
    return ALL_INCORRECT;
  }else if (numAnsweredCorrectly < correctAnswer.length){
    return SOME_CORRECT;
  }else{
    return null;
  }
}

function whereIdIsEqual(id){
  return function(match){
    return match.id === id;
  };
}

function buildCorrectnessMatrix(question, answer, settings) {

  var matrix = question.correctResponse.map(function(correctRow){
    var answerRow = _.find(answer, whereIdIsEqual(correctRow.id));
    var zippedMatchSet = _.zip(correctRow.matchSet,answerRow.matchSet);

    var matchSet = zippedMatchSet.map(function(zippedMatches){

      var correctMatch = zippedMatches[0];
      var answeredMatch = zippedMatches[1];
      var correctness = "";

      if (answeredMatch){
        correctness = correctMatch ? "correct" : "incorrect";
      }else{
        correctness = "unknown";
      }

      return {
        "correctness":correctness,
        "value":answeredMatch
      };
    });

    return {
      "id":correctRow.id,
      "matchSet":matchSet
    };

  });

  return matrix;
}

var defaultFeedbackTable = {};
defaultFeedbackTable[ALL_CORRECT] = keys.DEFAULT_CORRECT_FEEDBACK;
defaultFeedbackTable[ALL_INCORRECT] = keys.DEFAULT_INCORRECT_FEEDBACK;
defaultFeedbackTable[SOME_CORRECT] = keys.DEFAULT_PARTIAL_FEEDBACK;

function buildFeedbackSummary(question,correctness){
  var feedbackDef = (question && question.feedback && question.feedback[correctness]);

  if (!feedbackDef || !feedbackDef.type || feedbackDef.type.length === 0 || feedbackDef.type === 'none'){
    return null;
  }else if (feedbackDef.type === 'default'){
    return defaultFeedbackTable[correctness];
  }else if (feedbackDef.text && feedbackDef.text.length > 0){
    return feedbackDef.text;
  }else{
    return defaultFeedbackTable[correctness];
  }
}

function calculateScore(question, answer) {

  var calculatePartialScore = function(){
    var partialScore = _.reduce(answer,function(acc, answerRow) {
      var rowScore = question.partialScores[answerRow.id];
      var correctMatchSet = _.find(question.correctResponse,whereIdIsEqual(answerRow.id)).matchSet;
      var isRowCorrect = _.isEqual(answerRow.matchSet,correctMatchSet);
      return acc + (isRowCorrect ? rowScore : 0);
    },0);
    return partialScore;
  };

  var maxCorrect = question.correctResponse.length;
  var correctCount = countCorrectAnswers(answer,question.correctResponse);

  if (correctCount === 0) {
    return 0;
  }

  if (correctCount === maxCorrect) {
    return 1;
  }

  if (maxCorrect > 1 && question.allowPartialScoring) {
    return calculatePartialScore(correctCount) / 100;
  }
  else if (correctCount < maxCorrect){
    return 0;
  }
}


/*
 Create a response to the answer based on the question, the answer and the respond settings
 */
exports.respond = function(question, answer, settings) {

  var correctness = getCorrectnessString(answer, question.correctResponse);

  if(!answer){
    return {
      correctness: 'incorrect',
      score: 0,
      feedback: buildFeedbackSummary(question,correctness)
    };
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var response = {
    correctness: correctness,
    score: calculateScore(question, answer),
    comments: question.comments
  };

  if (settings.showFeedback) {
    response.feedback = {
      correctnessMatrix : buildCorrectnessMatrix(question, answer, settings),
      summary : buildFeedbackSummary(question,correctness)
    };
    if (question.summaryFeedback){
      response.summaryFeedback = question.summaryFeedback;
    }
  }

  return response;
};
