exports.keys = {
  DEFAULT_CORRECT_FEEDBACK:  "Correct!",
  DEFAULT_PARTIAL_FEEDBACK : "Almost!",
  DEFAULT_INCORRECT_FEEDBACK : "Good try but that is not the correct answer."
};

exports.defaults = {
  correct: exports.keys.DEFAULT_CORRECT_FEEDBACK,
  incorrect: exports.keys.DEFAULT_INCORRECT_FEEDBACK,
  partial: exports.keys.DEFAULT_PARTIAL_FEEDBACK 
};

var correctnessToFeedbackMap = {
  correct: 'correctFeedback',
  incorrect: 'incorrectFeedback',
  partial: 'partialFeedback'
};

exports.correctness = function(isCorrect, isPartiallyCorrect){
  return isCorrect ? 'correct' : isPartiallyCorrect ? 'partial' : 'incorrect';
};

/**
 * build the feedback object
 * @param  {object} feedback    the feedback config
 * @param  {string} correctness correct/incorrect/partial
 * @param  {object} defaults    optional default feedback object
 * @return {object}             the generated feedback object
 */
exports.makeFeedback = function(feedback, correctness, defaults){
  defaults = defaults || exports.defaults;
  var key = correctnessToFeedbackMap[correctness];
  var feedbackType = key + 'Type';
  var actualType = feedback ? (feedback[feedbackType] || 'default') : 'default';
  if (actualType === 'custom') {
    return feedback[key];
  } else if(actualType === 'none' ){
    return undefined;
  } else {
    return defaults[correctness];
  }
};