var _ = require('lodash');

exports.render = function (element) {
  return element;
};

exports.isCorrect = function () {
  return true;
};

exports.respond = function (model, answer, settings, targetOutcome) {
  var response = {};

  var isCorrect = _.find(model.feedback.correct, function(v,k) {
     return k == targetOutcome.studentResponse;
  });

  if (isCorrect) {
    response.feedback = model.feedback.correct[targetOutcome.studentResponse];
  } else {
    response.feedback = model.feedback.incorrect[targetOutcome.studentResponse] || model.feedback.incorrect["*"];
  }

  response.correctness = isCorrect ? "correct" : "incorrect";

  response.studentResponse = targetOutcome.studentResponse;
  return response;
};
