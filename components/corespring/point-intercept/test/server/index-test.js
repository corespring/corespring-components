/*jshint expr: true*/
var proxyquire = require('proxyquire').noCallThru();

var fbu = require('../../../server-shared/src/server/feedback-utils');

var server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});
var _ = require('lodash');
var assert = require('assert');
var helper = require('../../../../../test-lib/test-helper');
var should = require('should');

var component = {
  componentType: "corespring-point-interaction",
  "correctResponse": [
    "0,0",
    "1,1"
  ],
  "feedback": {
    "correctFeedbackType": "default",
    "incorrectFeedbackType": "default",
    "partialFeedbackType": "default"
  },
  "model": {
    "config": {
      "labelsType": "present",
      "orderMatters": true
    }
  },
  allowPartialScoring: false
};

var defaultSettings = helper.settings(true, true, false);

describe('correctness logic', function() {
  it('when order matters', function() {
    server.isCorrect(['0,1', '12,4'], ['12,4', '0,1'], true).should.equal(false);
    server.isCorrect(['0,1', '12,4'], ['0,1', '12,4'], true).should.equal(true);
  });

  it('when order doesnt matter', function() {
    server.isCorrect(['0,1', '12,4'], ['12,4', '0,1'], false).should.equal(true);
    server.isCorrect(['0,9', '12,4'], ['0,1', '12,4'], true).should.equal(false);
  });
});

describe('server logic', function() {

  describe('when no answer is given', function(){

    function assertNoAnswerWarning(answers) {
      var outcome = server.createOutcome({}, answers, helper.settings(true, true, true));
      outcome.should.eql({
        correctness: "warning",
        score: 0,
        feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK,
        outcome: "warning"
      });
    }

    it('warns when the answer is null', function() {
      assertNoAnswerWarning(null);
    });

    it('warns when the answer is undefined', function() {
      assertNoAnswerWarning(undefined);
    });

    it('warns when the answer is empty array', function() {
      assertNoAnswerWarning([]);
    });
  });

  it('should respond with correct and score 1 if the answer is correct', function() {
    var response = server.createOutcome(_.cloneDeep(component), ["0,0", "1,1"], defaultSettings);
    response.correctness.should.equal("correct");
    response.score.should.equal(1);
  });

  it('should respond with incorrect and score 0 if the answer is incorrect', function() {
    var response = server.createOutcome(_.cloneDeep(component), ["1,2", "3,1"], defaultSettings);
    response.correctness.should.equal("incorrect");
    response.score.should.equal(0);
  });

  it('should respond with partial and score 0 if the answer is partially correct, but partial scoring is disabled', function() {
    var response = server.createOutcome(_.cloneDeep(component), ["0,0", "3,1"], defaultSettings);
    response.correctness.should.equal("partial");
    response.score.should.equal(0);
  });

  it('should respond with partial and score 0.5 if the answer is partially correct and partial scoring is enabled', function() {
    var partialAllowedComponent = _.cloneDeep(component);
    partialAllowedComponent.allowPartialScoring = true;
    partialAllowedComponent.partialScoring = [{
      numberOfCorrect: 1,
      scorePercentage: 50
    }];
    var response = server.createOutcome(_.cloneDeep(partialAllowedComponent), ["0,0", "3,1"], defaultSettings);
    response.correctness.should.equal("partial");
    response.score.should.equal(0.5);
  });

  it('if partial scoring is allowed score should be calculated using it', function() {
    var clone = _.cloneDeep(component);
    clone.allowPartialScoring = true;
    clone.partialScoring = [
      {numberOfCorrect: 1, scorePercentage: 50}
    ];

    var response = server.createOutcome(clone, ["1,2", "3,1"], defaultSettings);
    response.correctness.should.equal("incorrect");
    response.score.should.equal(0);
    
    response = server.createOutcome(clone, ["0,0", "3,1"], defaultSettings);
    response.correctness.should.equal("partial");
    response.score.should.equal(0.5);

    response = server.createOutcome(clone, ["0,0", "1,1"], defaultSettings);
    response.correctness.should.equal("correct");
    response.score.should.equal(1);

    // score will be given, even when the user marks extra points
    response = server.createOutcome(clone, ["0,0", "1,1", "2,2"], defaultSettings);
    response.correctness.should.equal("correct");
    response.score.should.equal(1);
  });

  it('respects order matters', function() {
    var response = server.createOutcome(_.cloneDeep(component), ["0,0", "1,1"], defaultSettings);
    response.correctness.should.equal("correct");
    response.score.should.equal(1);

    response = server.createOutcome(_.cloneDeep(component), ["1,1", "0,0"], defaultSettings);
    response.correctness.should.equal("incorrect");
    response.score.should.equal(0);
  });

  it('respects order doesnt matter', function() {
    var clone = _.cloneDeep(component);
    clone.model.config.labelsType = "absent";
    clone.model.config.orderMatters = false;

    var response = server.createOutcome(clone, ["0,0", "1,1"], defaultSettings);
    response.correctness.should.equal("correct");
    response.score.should.equal(1);

    response = server.createOutcome(clone, ["1,1", "0,0"], defaultSettings);
    response.correctness.should.equal("correct");
    response.score.should.equal(1);
  });

  it('gives default feedback if feedback type is default', function() {
    var clone = _.cloneDeep(component);
    var response = server.createOutcome(clone, ["0,0", "1,1"], defaultSettings);
    response.feedback.should.equal(fbu.keys.DEFAULT_CORRECT_FEEDBACK);

    response = server.createOutcome(clone, ["2,2", "2,1"], defaultSettings);
    response.feedback.should.equal(fbu.keys.DEFAULT_INCORRECT_FEEDBACK);

    response = server.createOutcome(clone, ["0,0", "2,2"], defaultSettings);
    response.feedback.should.equal(fbu.keys.DEFAULT_PARTIAL_FEEDBACK);

    clone.allowPartialScoring = true;

    response = server.createOutcome(clone, ["2,2", "1,1"], defaultSettings);
    response.feedback.should.equal(fbu.keys.DEFAULT_PARTIAL_FEEDBACK);
  });

  it('gives no feedback if feedback type is none', function() {
    var clone = _.cloneDeep(component);
    clone.feedback.correctFeedbackType = "none";
    clone.feedback.incorrectFeedbackType = "none";
    clone.feedback.partialFeedbackType = "none";

    var response = server.createOutcome(clone, ["0,0", "1,1"], defaultSettings);
    should(response.feedback).not.be.ok;

    response = server.createOutcome(clone, ["2,2", "1,1"], defaultSettings);
    should(response.feedback).not.be.ok;

    clone.allowPartialScoring = true;
    
    response = server.createOutcome(clone, ["0,0", "2,2"], defaultSettings);
    should(response.feedback).not.be.ok;
  });

  it('gives custom feedback if feedback type is custom', function() {
    var clone = _.cloneDeep(component);
    clone.feedback.correctFeedbackType = "custom";
    clone.feedback.correctFeedback = "CustomCorrect";

    clone.feedback.incorrectFeedbackType = "custom";
    clone.feedback.incorrectFeedback = "CustomIncorrect";
    
    clone.feedback.partialFeedbackType = "custom";
    clone.feedback.partialFeedback = "CustomPartial";

    var response = server.createOutcome(clone, ["0,0", "1,1"], defaultSettings);
    response.feedback.should.equal("CustomCorrect");

    response = server.createOutcome(clone, ["2,2", "2,1"], defaultSettings);
    response.feedback.should.equal("CustomIncorrect");

    response = server.createOutcome(clone, ["2,2", "1,1"], defaultSettings);
    response.feedback.should.equal("CustomPartial");

    clone.allowPartialScoring = true;

    response = server.createOutcome(clone, ["0,0", "2,2"], defaultSettings);
    response.feedback.should.equal("CustomPartial");
  });

});