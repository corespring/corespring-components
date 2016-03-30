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
        "domainLabel": "x",
        "domainMin": -10,
        "domainMax": 10,
        "domainStepValue": 1,
        "domainSnapValue": 1,
        "domainLabelFrequency": 1,
        "domainGraphPadding": 50,
        "rangeLabel": "y",
        "rangeMin": -10,
        "rangeMax": 10,
        "rangeStepValue": 1,
        "rangeSnapValue": 1,
        "rangeLabelFrequency": 1,
        "rangeGraphPadding": 50,
        "sigfigs": "-1"
      }
    }
  };

  var correctAnswer = "2x+7";

  var incorrectAnswer = "x-2";

  var emptyAnswer = "";

  it('returns warning outcome for an empty answer', function() {
    var outcome = server.createOutcome(_.cloneDeep(component), emptyAnswer, helper.settings(true, true, true));
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
    response.score.should.eql(0);
    // check if it was called with the right options
    spy.getCall(0).args[2].should.eql({
      variable: 'x',
      sigfigs: 3
    });
  });

  it('respond correct', function() {
    var response = server.createOutcome(_.cloneDeep(component), correctAnswer, helper.settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  describe('with empty answer', function() {
    var response;

    beforeEach(function() {
      response = server.createOutcome(_.cloneDeep(component), {}, helper.settings(false, true, true));
    });

    it('should return warning', function() {
      response.correctness.should.eql('warning');
    });

    it('should return a score of 0', function() {
      response.score.should.eql(0);
    });

    it('should return null feedback', function() {
      (response.feedback === null).should.eql(true);
    });

  });

  describe('feedback', function() {

    function evaluateCorrectAnswerWithFeedback(feedback) {
      var componentWithFeedback = _.cloneDeep(component);
      componentWithFeedback.feedback = feedback;
      return server.createOutcome(componentWithFeedback, correctAnswer, helper.settings(true, true, true));
    }

    it('should be default feedback if feedback obj is null', function() {
      var feedback = null;
      var response = evaluateCorrectAnswerWithFeedback(feedback);
      response.feedback.should.eql('Correct!');
    });

    it('should be custom feedback if feedbackType is "custom"', function() {
      var feedback = {
        correctFeedbackType: 'custom',
        correctFeedback: 'Custom Correct!'
      };
      var response = evaluateCorrectAnswerWithFeedback(feedback);
      response.feedback.should.eql('Custom Correct!');
    });

    it('should be default feedback if feedbackType is not "custom"', function() {
      var feedback = {
        correctFeedbackType: 'anything else but custom',
        correctFeedback: 'Custom Correct!'
      };
      var response = evaluateCorrectAnswerWithFeedback(feedback);
      response.feedback.should.eql(fbu.keys.DEFAULT_CORRECT_FEEDBACK);
    });

  });

  describe('outcome', function() {
    it('should be populated for incorrect answer', function() {
      var response = server.createOutcome(component, incorrectAnswer, helper.settings(true, true, true));
      response.outcome.should.eql(['incorrect']);
    });
    it('should be populated for correct answer', function() {
      var response = server.createOutcome(component, correctAnswer, helper.settings(true, true, true));
      response.outcome.should.eql(['correct']);
    });
  });

  describe('isScoreable', function() {
    it('should be true for an incomplete model', function() {
      server.isScoreable(null, {}, {}).should.eql(true);
      server.isScoreable({}, {}, {}).should.eql(true);
      server.isScoreable({ model: {}}, {}, {}).should.eql(true);
      server.isScoreable({ model: { config: {}}}, {}, {}).should.eql(true);
    });

    it('should be the opposite of exhibitOnly', function() {
      server.isScoreable({ model: { config: { exhibitOnly: false}}}, {}, {}).should.eql(true);
      server.isScoreable({ model: { config: { exhibitOnly: true}}}, {}, {}).should.eql(false);
    });
  });

});
