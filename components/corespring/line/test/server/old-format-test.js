var _ = require('lodash');
var assert = require('assert');
var helper = require('../../../../../test-lib/test-helper');
var sinon = require('sinon');
var should = require('should');
var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');

describe('line interaction server logic', function() {

  var serverObj = {
    expressionize: _.identity,
    isFunctionEqual: function(e1, e2, options) {
      return e1 === e2;
    }
  };

  var server = proxyquire('../../src/server', {
    'corespring.function-utils.server': serverObj,
    'corespring.server-shared.server.feedback-utils': fbu
  });

  var component = {
    "componentType": "corespring-line",
    "correctResponse": "y=-0.5x+1",
    "model": {
      "config": {
        "domainLabel": "X",
        "rangeLabel": "Y",
        "graphWidth": 550,
        "graphHeight": 550,
        "graphPadding": 50,
        "domainMin": -5,
        "domainMax": 5,
        "domainStepValue": 1,
        "domainLabelFrequency": 1,
        "rangeMin": -5,
        "rangeMax": 5,
        "rangeStepValue": 1,
        "rangeLabelFrequency": 1,
        "scale": 1,
        "tickLabelFrequency": 1,
        "showCoordinates": false,
        "maxPoints": 1
      }
    }
  };

  var pointsResponse = {
    "A": {
      "index": 0,
      "name": "A",
      "x": 0,
      "y": 1,
      "isSet": true
    },
    "B": {
      "index": 1,
      "name": "B",
      "x": 2,
      "y": 0,
      "isSet": true
    }
  };

  describe('prior points response format', function () {

    it('should return a score', function () {

      var outcome = server.createOutcome(_.cloneDeep(component), pointsResponse, helper.settings(true, true, true));
      outcome.correctness.should.eql('incorrect');
      outcome.score.should.eql(0);
    });

  });

});