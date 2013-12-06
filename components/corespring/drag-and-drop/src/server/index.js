var _ = require('lodash');

exports.respond = function(question, answer, settings){
  var isCorrect = _.isEqual(question.correctResponse, answer);
  return {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    answer : answer,
    score: isCorrect ? 1 : 0
  };
};

exports.render = function(model){
  delete model.correctResponse;
  delete model.feedback;
  return model;
};