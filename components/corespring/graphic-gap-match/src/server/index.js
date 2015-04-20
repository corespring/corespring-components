var _ = require('lodash');
var fb = require('corespring.server-shared.server.feedback-utils');
var keys = fb.keys;

exports.keys = keys;

exports.createOutcome = function(question, answer, settings) {
  console.log('a',answer);

  var isChoiceInHotspot = function(choice, hotspot) {
    var choiceWidth = 10;
    var choiceHeight = 10;
    if (hotspot.shape === 'rect') {
      return choice.left >= hotspot.coords.left && choice.top >= hotspot.coords.top && (choice.left + choiceWidth) <= (hotspot.coords.left + hotspot.coords.width) && (choice.top + choiceHeight) <= (hotspot.coords.top + hotspot.coords.height);
    }
  };

  var isAnswerCorrect = function(answer) {
    var correctResponseForChoice = _.find(question.correctResponse, function(cr) {
      return cr.id === answer.id;
    });

    if (correctResponseForChoice) {
      var correctHotspot = correctResponseForChoice.hotspot;
      var hotspotForChoice = _.find(question.model.hotspots, function(hs) {
        return isChoiceInHotspot(answer, hs);
      });
      return (!_.isUndefined(hotspotForChoice) && hotspotForChoice.id === correctHotspot);
    }
  };

  var getFeedbackForChoices = function() {
    return _.map(answer, function(a) {
       return {
         id: a.id,
         isCorrect: isAnswerCorrect(a)
       }
    });
  };

  if (!answer || _.isEmpty(answer)) {
    return {
      correctness: 'warning',
      correctClass: 'warning',
      score: 0,
      feedback: settings.showFeedback ? {
        correctness: 'warning',
        message: "You did not enter a response."
      } : null
    };
  }

  if (question._uid !== answer._uid) {
    throw "Error - the uids must match";
  }

  var isCorrect = answer.length === question.correctResponse.length && _.every(answer, isAnswerCorrect);
  var isPartiallyCorrect = false;

  var response = {
    correctness: isCorrect ? "correct" : "incorrect",
    correctClass: fb.correctness(isCorrect, isPartiallyCorrect),
    correctResponse: question.correctResponse,
    score: isCorrect ? 1 : 0
  };

  if (settings.showFeedback) {
    response.feedback = {
      choices: getFeedbackForChoices(),
      message: fb.makeFeedback(question.feedback, fb.correctness(isCorrect, isPartiallyCorrect))
    };
  }

  return response;
};
