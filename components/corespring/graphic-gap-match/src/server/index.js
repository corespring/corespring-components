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

exports.getOverlappingRectangle = function(rect1, rect2) {
  
  var r1 = _.cloneDeep(rect1);
  var r2 = _.cloneDeep(rect2);
  
  r1.bottom = r1.top + r1.height;
  r1.right = r1.left + r1.width;
  
  r2.bottom = r2.top + r2.height;
  r2.right = r2.left + r2.width;
  
  var overlappingRectangle = {left: NaN, top: NaN, width: 0, height: 0};

  overlappingRectangle.right = Math.min(r1.right, r2.right);
  if (r2.left >= r1.left && r2.left <= r1.right) {
    overlappingRectangle.left = r2.left;
  } else if (r1.left >= r2.left && r1.left <= r2.right) {
    overlappingRectangle.left = r1.left;
  }

  overlappingRectangle.bottom = Math.min(r1.bottom, r2.bottom);
  if (r2.top >= r1.top && r2.top <= r1.bottom) {
    overlappingRectangle.top = r2.top;
  } else if (r1.top >= r2.top && r1.top <= r2.bottom) {
    overlappingRectangle.top = r1.top;
  }

  if (!isNaN(overlappingRectangle.left)) {
    overlappingRectangle.width = overlappingRectangle.right - overlappingRectangle.left;
  }
  if (!isNaN(overlappingRectangle.top)) {
    overlappingRectangle.height = overlappingRectangle.bottom - overlappingRectangle.top;
  }
  delete overlappingRectangle.right;
  delete overlappingRectangle.bottom;


  return overlappingRectangle;
};

exports.getOverlappingPercentage = function (rect1, rect2) {
  var r1Area = rect1.width * rect1.height;
  var r2Area = rect2.width * rect2.height;
  var overlappingRectangle = exports.getOverlappingRectangle(rect1, rect2);
  var overlapArea = overlappingRectangle.width * overlappingRectangle.height;
  var smallerRectArea = Math.min(r1Area, r2Area);
  return overlapArea / smallerRectArea;
};

exports.createOutcome = function (question, answer, settings) {
  var isChoiceInHotspot = function (choice, hotspot) {
    var answerForChoice = _.find(answer, function (a) {
      return a.id === choice.id;
    });
    var choiceWidth = (answerForChoice && answerForChoice.width) || 10;
    var choiceHeight = (answerForChoice && answerForChoice.height) || 10;
    if (hotspot.shape === 'rect') {
      var choiceRect = {left: choice.left, top: choice.top, width: choiceWidth, height: choiceHeight};
      var hotspotRect = hotspot.coords;
      var perc = exports.getOverlappingPercentage(choiceRect, hotspotRect);
      // Choice is considered to be in the hotspot if overlap is > 70% of the choice size
      return perc > 0.7;
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
