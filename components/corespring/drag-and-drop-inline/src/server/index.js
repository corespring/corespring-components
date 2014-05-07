var _ = require('lodash');
var dragAndDropEngine = require("corespring.drag-and-drop-engine.server");

exports.DEFAULT_CORRECT_FEEDBACK = "Correct!";
exports.DEFAULT_PARTIAL_FEEDBACK = "Almost!";
exports.DEFAULT_INCORRECT_FEEDBACK = "Good try but that is not the correct answer.";

exports.respond = function(question, answer, settings) {

  var defaults = {
    correct: exports.DEFAULT_CORRECT_FEEDBACK,
    incorrect: exports.DEFAULT_INCORRECT_FEEDBACK,
    partial: exports.DEFAULT_PARTIAL_FEEDBACK
  };

  return dragAndDropEngine.createResponse(question, answer, settings, defaults);
};
