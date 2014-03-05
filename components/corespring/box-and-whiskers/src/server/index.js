var _ = require('lodash');

exports.isCorrect = function(answer, correctAnswer) {
};



exports.respond = function(question, answer, settings) {

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }


  console.log("A:"+JSON.stringify(answer));
  console.log("Q:"+JSON.stringify(question.model));

  var response = {};

  return response;
};
