var _ = require('lodash');

exports.keys = {
  DEFAULT_CORRECT_FEEDBACK: "Correct!",
  DEFAULT_PARTIAL_FEEDBACK: "Almost!",
  DEFAULT_INCORRECT_FEEDBACK: "Good try but that is not the correct answer.",
  DEFAULT_NOT_CHOSEN_FEEDBACK: "This answer is correct",
  DEFAULT_SUBMITTED_FEEDBACK: "Your answer has been submitted",
  DEFAULT_WARNING_FEEDBACK: "You did not enter a response."
};

exports.defaults = {
  correct: exports.keys.DEFAULT_CORRECT_FEEDBACK,
  incorrect: exports.keys.DEFAULT_INCORRECT_FEEDBACK,
  partial: exports.keys.DEFAULT_PARTIAL_FEEDBACK,
  notChosen: exports.keys.DEFAULT_NOT_CHOSEN_FEEDBACK,
  warning: exports.keys.DEFAULT_WARNING_FEEDBACK
};

var correctnessToFeedbackMap = {
  correct: 'correctFeedback',
  incorrect: 'incorrectFeedback',
  partial: 'partialFeedback'
};

exports.correctness = correctness;
exports.makeFeedback = makeFeedback;
exports.defaultCreateOutcome = defaultCreateOutcome;


function correctness(isCorrect, isPartiallyCorrect) {
  return isCorrect ? 'correct' : isPartiallyCorrect ? 'partial' : 'incorrect';
}

/**
 * build the feedback object
 * @param  {object} feedback    the feedback config
 * @param  {string} correctness correct/incorrect/partial
 * @param  {object} defaults    optional default feedback object
 * @return {object}             the generated feedback object
 */
function makeFeedback(feedback, correctness, defaults) {
  defaults = defaults || exports.defaults;
  var key = correctnessToFeedbackMap[correctness];
  var feedbackType = key + 'Type';
  var actualType = feedback ? (feedback[feedbackType] || 'default') : 'default';
  if (actualType === 'custom') {
    return feedback[key];
  } else if (actualType === 'none') {
    return undefined;
  } else {
    return defaults[correctness];
  }
}

/**
 * Quite a few comps seem to have a similar, if not the same
 * createOutcome method apart from where they get the numbers
 * from. By passing the numbers in, we are able to factor
 * out the common behaviour into the method below.
 *
 * @param question
 * @param answer
 * @param settings
 * @param numAnswers
 * @param numAnsweredCorrectly
 * @param totalCorrectAnswers
 * @param scoreFn optional function to override the default score calculation
 * @returns {*}
 */
function defaultCreateOutcome(
  question,
  answer,
  settings,
  numAnswers,
  numAnsweredCorrectly,
  totalCorrectAnswers,
  scoreFn
) {

  settings = settings || {};

  if (numAnswers === 0) {
    return makeResponse('incorrect', 'warning', 0, 'answer-expected');
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var isCorrect = totalCorrectAnswers === numAnsweredCorrectly && totalCorrectAnswers === numAnswers;
  var isPartiallyCorrect = !isCorrect && numAnsweredCorrectly > 0;

  var score = (scoreFn || defaultScoreFn)(isCorrect, isPartiallyCorrect);

  var response = makeResponse(
    isCorrect ? 'correct' : 'incorrect',
    correctness(isCorrect, isPartiallyCorrect),
    score);

  return response;

  //----------------------------------------------------

  function makeResponse(correctness, correctClass, score, warningClass) {
    var response = {};
    response.correctness = correctness;
    response.correctClass = correctClass;
    response.score = score;
    if (correctClass === 'partial' || correctClass === 'incorrect') {
      response.correctResponse = question.correctResponse;
    }
    if (settings.showFeedback) {
      response.feedback = makeFeedback(question.feedback, correctClass);
    }
    if (question.comments) {
      response.comments = question.comments;
    }
    if (warningClass) {
      response.warningClass = warningClass;
    }
    return response;
  }

  function defaultScoreFn(isCorrect, isPartiallyCorrect){
    if (isCorrect) {
      return 1;
    }
    if (isPartiallyCorrect && question.allowPartialScoring) {
      return calcPartialScoring(question.partialScoring, numAnsweredCorrectly) / 100;
    }
    return 0;
  }

  function calcPartialScoring(partialScoring, numAnsweredCorrectly) {
    var partialScore = findPartialScoringScenario(partialScoring, numAnsweredCorrectly);
    return partialScore ? partialScore.scorePercentage : 0;
  }

  function findPartialScoringScenario(scenarios, numAnsweredCorrectly) {
    var scenario = _.find(scenarios, function(ps) {
      return ps.numberOfCorrect === numAnsweredCorrectly;
    });
    return scenario;
  }

}