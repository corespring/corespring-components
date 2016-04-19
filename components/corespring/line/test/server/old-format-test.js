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
    "correctResponse": "y=2x+7",
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

  var correctAnswer = { A: { x:0, y: 7, isSet: true }, B: { x: 1, y: 9, isSet: true } };

  var incorrectAnswer = { A: { x: 0, y: 3, isSet: true }, B: { x: 0, y: 0, isSet: true } };

  var incompleteAnswer = { A: { x: 0, y: 3, isSet: true }, B: { isSet: false } };

  var notDefinedAnswer = {};

  var emptyAnswer = { A: { isSet: false }, B: { isSet: false } };

  var malformedAnswer = { A: { isSet: true }, B: { isSet: true } };

  describe('prior points response format', function () {

    it('returns warning outcome for a not defined answer ({})', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), notDefinedAnswer, helper.settings(true, true, true));
      outcome.should.eql({
        correctness: 'warning',
        score: 0,
        feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
      });
    });

    it('returns warning outcome for an empty answer (isSet false)', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), emptyAnswer, helper.settings(true, true, true));
      outcome.should.eql({
        correctness: 'warning',
        score: 0,
        feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
      });
    });

    it('returns warning outcome for an incomplete answer (only one point)', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), incompleteAnswer, helper.settings(true, true, true));
      outcome.should.eql({
        correctness: 'warning',
        score: 0,
        feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
      });
    });

    it('returns warning outcome for a malformed answer (isSet true but no x or y)', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), malformedAnswer, helper.settings(true, true, true));
      outcome.should.eql({
        correctness: 'warning',
        score: 0,
        feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
      });
    });

    it('respond incorrect', function() {
      var spy = sinon.spy(serverObj, 'isFunctionEqual');
      var response = server.createOutcome(_.cloneDeep(component), incorrectAnswer, helper.settings(false, true, true));
      response.correctness.should.eql('incorrect');
      response.score.should.equal(0);
      // check if it was called with the right options
      spy.getCall(0).args[2].should.eql({
        variable: 'x',
        sigfigs: 3
      });
    });

    it('respond correct', function() {
      var response = server.createOutcome(_.cloneDeep(component), correctAnswer, helper.settings(false, true, true));
      response.correctness.should.eql('correct');
      response.score.should.equal(1);
    });

  });

});