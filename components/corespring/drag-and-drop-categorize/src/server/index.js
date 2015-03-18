var _ = require('lodash');
var dragAndDropEngine = require("corespring.drag-and-drop-engine.server");
var feedbackUtils = require('corespring.server-shared.server.feedback-utils');

exports.keys = feedbackUtils.keys;

exports.createOutcome = function(question, answer, settings) {

  var defaults = {
    correct: exports.DEFAULT_CORRECT_FEEDBACK,
    incorrect: exports.DEFAULT_INCORRECT_FEEDBACK,
    partial: exports.DEFAULT_PARTIAL_FEEDBACK
  };

  return dragAndDropEngine.createResponse(question, answer, settings, defaults);

};
