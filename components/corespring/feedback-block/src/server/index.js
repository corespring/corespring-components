var _ = require('lodash');

exports.render = function (element) {
  return element;
};

exports.isCorrect = function () {
  return true;
};

exports.respond = function (question, answer, settings) {
  var response = {
    correctness: "correct",
    score: 0
  };
  response.feedback = {"malac": "fasz"};
  return response;
};
