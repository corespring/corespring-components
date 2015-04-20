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

  //Here you can add more specific feedback for your interaction

  return response;
}

function countNumberOfAnswers(answers) {
  //TODO calculate the number of answers the user has given
  return 0;
}

function countNumberOfCorrectAnswers(question, answers) {
  //TODO calculate the number of correct answers the user has given
  return 0;
}

function countNumberOfExpectedAnswers(question) {
  //TODO calculate the number of answers that are expected for this interaction
  return 0;
}

