var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");
var fbu = require('corespring.server-shared.server.feedback-utils');

exports.render = function(item) {
  return item;
};

exports.isScoreable = function(question, answer, outcome) {
  if(!question || !question.model || !question.model.config){
    return true;
  }

  return !question.model.config.exhibitOnly;
};

exports.createOutcome = function(question, answer, settings) {

  function validAnswer(answer) {
    return true;
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

  var res = {};
  return res;

};
