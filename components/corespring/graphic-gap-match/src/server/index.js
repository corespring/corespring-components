var _ = require('lodash');
var fb = require('corespring.server-shared.server.feedback-utils');
var keys = fb.keys;

exports.keys = keys;

exports.isPointInsidePolygon = function (point, vs) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0], yi = vs[i][1];
    var xj = vs[j][0], yj = vs[j][1];

    var intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
};


exports.createOutcome = function (question, answer, settings) {
  var isChoiceInHotspot = function (choice, hotspot) {
    var answerForChoice = _.find(answer, function (a) {
      return a.id === choice.id;
    });
    var choiceWidth = (answerForChoice && answerForChoice.width) || 10;
    var choiceHeight = (answerForChoice && answerForChoice.height) || 10;
    if (hotspot.shape === 'rect') {
      return choice.left >= hotspot.coords.left && choice.top >= hotspot.coords.top && (choice.left + choiceWidth) <= (hotspot.coords.left + hotspot.coords.width) && (choice.top + choiceHeight) <= (hotspot.coords.top + hotspot.coords.height);
    } else if (hotspot.shape === 'poly') {
      var polygonPoints = _.map(hotspot.coords, function (c) {
        return [c.x, c.y];
      });
      return exports.isPointInsidePolygon([choice.left, choice.top], polygonPoints) &&
        exports.isPointInsidePolygon([choice.left + choiceWidth, choice.top + choiceHeight], polygonPoints);
    }
  };

  var mutableCorrectResponse;

  var hotspotAndCorrectnessForAnswer = function (answer) {
    var foundHotspot;
    var result = _.find(mutableCorrectResponse, function (cr) {
      if (cr.id === answer.id) {
        var correctResponseForChoice = cr;
        if (correctResponseForChoice) {
          var correctHotspot = correctResponseForChoice.hotspot;
          var hotspotForChoice = _.find(question.model.hotspots, function (hs) {
            return isChoiceInHotspot(answer, hs);
          });
          var isCorrect = (!_.isUndefined(hotspotForChoice) && hotspotForChoice.id === correctHotspot);
          if (isCorrect) {
            foundHotspot = hotspotForChoice.id;
            cr.id = undefined;
          }
          return isCorrect;
        }
      }
      return false;
    });

    var isCorrect = !_.isUndefined(result);
    var hotspot = foundHotspot;
    return {isCorrect: isCorrect, hotspot: hotspot};
  };

  var isAnswerCorrect = function (answer) {
    return hotspotAndCorrectnessForAnswer(answer).isCorrect;
  };

  var getFeedbackForChoices = function () {
    return _.map(answer, function (a) {
      var hotspotAndCorrectness = hotspotAndCorrectnessForAnswer(a);
      return {
        id: a.id,
        isCorrect: hotspotAndCorrectness.isCorrect,
        hotspot: hotspotAndCorrectness.hotspot,
        left: a.left,
        top: a.top
      };
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

  var withCleanMutableCorrectResponse = function (fn) {
    mutableCorrectResponse = _.cloneDeep(question.correctResponse);
    return fn();
  };

  var correctlyAnswered = withCleanMutableCorrectResponse(function () {
    return _.filter(answer, isAnswerCorrect);
  });

  var isCorrect = withCleanMutableCorrectResponse(function () {
    return answer.length === question.correctResponse.length && _.every(answer, isAnswerCorrect);
  });

  var isPartiallyCorrect = false;

  var response = {
    correctness: isCorrect ? "correct" : "incorrect",
    correctClass: fb.correctness(isCorrect, isPartiallyCorrect),
    correctResponse: question.correctResponse,
    score: isCorrect ? 1 : 0,
    correctNum: (correctlyAnswered || []).length
  };

  mutableCorrectResponse = _.cloneDeep(question.correctResponse);
  if (settings.showFeedback) {
    response.feedback = {
      choices: getFeedbackForChoices(),
      message: fb.makeFeedback(question.feedback, fb.correctness(isCorrect, isPartiallyCorrect))
    };
  }

  return response;
};
