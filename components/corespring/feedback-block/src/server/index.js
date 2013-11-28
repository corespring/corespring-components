var _ = require('lodash');

exports.render = function (element) {
  return element;
};

exports.isCorrect = function () {
  return true;
};

exports.respond = function (question, answer, settings) {
  var response = {
  };
  response.feedback = {"correct": "true"};
  return response;
};
