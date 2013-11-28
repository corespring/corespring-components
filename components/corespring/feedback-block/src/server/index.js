var _ = require('lodash');

exports.render = function (element) {
  return element;
};

exports.isCorrect = function () {
  return true;
};

exports.respond = function (model, answer, settings, targetOutcome) {
  var response = {
  };
  response.feedback = model.feedback[targetOutcome.correctness];
  response.correctness = targetOutcome.correctness;
  return response;
};
