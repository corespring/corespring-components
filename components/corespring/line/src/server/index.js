var _ = require('lodash');
var functionUtils = require("corespring.function-utils.server");
var fbu = require('corespring.server-shared.server.feedback-utils');

exports.render = function(item) {
  if (_.isString(item.model.config.initialValues)) {
    item.initialCurve = functionUtils.expressionize(item.model.config.initialValues, 'x');
  }
  return item;
};

exports.respond = function(question, answer, settings) {

  console.log(JSON.stringify(question));

  if(!question || _.isEmpty(question)){
    throw new Error('question should never be empty or null');
  }
  console.log('->', JSON.stringify(question.model));
  console.log('->', question.model.exhibitOnly);

  if(question.model && question.model.config && question.model.config.exhibitOnly){
    console.log('exhibit only don\'t process');
    return {
      correctness: 'n/a',
      score: 0
    };
  }  

  var addFeedback = (settings.showFeedback && question.model && question.model.config && !question.model.config.exhibitOnly);

  if(!answer){
    return {
      correctness: 'incorrect',
      score: 0,
      feedback: addFeedback ? fbu.makeFeedback(question.feedback, 'incorrect') : null
    };
  }

  var slope = (answer.B.y - answer.A.y) / (answer.B.x - answer.A.x);
  var yintercept = answer.A.y - (slope * answer.A.x);
  var eq = slope + "x+" + yintercept;

  var options = {};
  options.variable = (question.correctResponse.vars && question.correctResponse.vars.split(",")[0]) || 'x';
  options.sigfigs = question.correctResponse.sigfigs || 3;

  var correctResponse = question.correctResponse;
  var correctFunction = question.correctResponse.split("=")[1];
  var isCorrect = functionUtils.isFunctionEqual(eq, correctFunction, options);

  var res = {};

  if (!question.model.config.exhibitOnly) {
    res = {
      correctness: isCorrect ? "correct" : "incorrect",
      score: isCorrect ? 1 : 0,
      correctResponse: {
        equation: correctResponse,
        expression: functionUtils.expressionize(correctResponse, 'x')
      }
    };
  }

  if (addFeedback) {
    res.feedback = fbu.makeFeedback(question.feedback, res.correctness);
  }

  return res;

};
