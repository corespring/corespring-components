var _ = require('lodash');
var sax = require('sax');

exports.createOutcome = function(question, answer, settings) {


  if(!answer){
    return {
      correctness: 'incorrect',
      correctResponse: question.correctResponse,
      answer: answer,
      score: 0
    };
  }
  
  var parser = sax.parser(false);
  var lps = {};

  parser.onopentag = function(node) {
    // opened a tag.  node has "name" and "attributes"
    if (node.attributes['landing-place'] !== undefined) {
      lps[node.attributes.ID] = node.attributes.CARDINALITY || 'multiple';
    }
  };

  parser.write('<xml>' + question.model.answerArea + '</xml>').close();

  var isCorrect = 1;

  for (var k in answer) {
    var correctResponseForId = question.correctResponse[k];
    if (lps[k] === 'ordered') {
      isCorrect &= _.isEqual(answer[k], correctResponseForId);
    } else {
      isCorrect &= _.isEmpty(_.xor(answer[k], correctResponseForId));
    }

    if (!isCorrect) {
      break;
    }
  }

  var res = {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    answer: answer,
    score: isCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    res.outcome = [];
    res.outcome.push( isCorrect ? "responseCorrect" : "responseIncorrect" );
  }

  return res;
};

exports.render = function(model) {
  delete model.correctResponse;
  delete model.feedback;
  return model;
};
