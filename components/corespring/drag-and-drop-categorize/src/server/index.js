var _ = require('lodash');
var sax = require('sax');

exports.DEFAULT_CORRECT_FEEDBACK = "Correct!";
exports.DEFAULT_PARTIAL_FEEDBACK = "Partially Correct!";
exports.DEFAULT_INCORRECT_FEEDBACK = "Good try but that is not the correct answer.";

exports.respond = function(question, answer, settings) {

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

  return {
    correctness: isCorrect ? "correct" : "incorrect",
    correctResponse: question.correctResponse,
    answer: answer,
    score: isCorrect ? 1 : 0
  };
};

exports.render = function(model) {
  delete model.correctResponse;
  delete model.feedback;
  return model;
};
