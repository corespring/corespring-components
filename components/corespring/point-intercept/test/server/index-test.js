var proxyquire = require('proxyquire').noCallThru();

var fbu = require('../../../server-shared/src/server/feedback-utils');

var server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});
var assert = require('assert');
var should = require('should');
var _ = require('lodash');
var helper = require('../../../../../test-lib/test-helper');

var component = {
  componentType: "corespring-point-interaction",
  "correctResponse": [
    "0,0",
    "1,1"
  ],
  "feedback": {
    "correctFeedbackType": "default",
    "incorrectFeedbackType": "default"
  },
  "model": {
    "config": {
      "labelsType": "present",
      "orderMatters": true
    }
  }
};

var defaultSettings = helper.settings(true, true, false);

describe('correctness logic', function() {
  it('when order matters', function() {
    server.isCorrect(['0,1', '12,4'], ['12,4', '0,1'], true).should.eql(false);
    server.isCorrect(['0,1', '12,4'], ['0,1', '12,4'], true).should.eql(true);
  });

  it('when order doesnt matter', function() {
    server.isCorrect(['0,1', '12,4'], ['12,4', '0,1'], false).should.eql(true);
    server.isCorrect(['0,9', '12,4'], ['0,1', '12,4'], true).should.eql(false);
  });
});

describe('server logic', function() {

  it('should return an incorrect outcome if the answer is empty', function() {

    var outcome = server.respond({}, null, helper.settings(true, true, true));
    outcome.should.eql({
        correctness: "incorrect",
        score: 0,
        correctResponse: null,
        feedback: fbu.keys.DEFAULT_INCORRECT_FEEDBACK,
        outcome: "incorrect"
      }
    );
  });

  it('should respond with correct and score 1 if the answer is correct', function() {
    var response = server.respond(_.cloneDeep(component), ["0,0", "1,1"], defaultSettings);
    response.correctness.should.eql("correct");
    response.score.should.eql(1);
  });

  it('should respond with incorrect and score 0 if the answer is incorrect', function() {
    var response = server.respond(_.cloneDeep(component), ["1,2", "3,1"], defaultSettings);
    response.correctness.should.eql("incorrect");
    response.score.should.eql(0);
  });

  it('respects order matters', function() {
    var response = server.respond(_.cloneDeep(component), ["0,0", "1,1"], defaultSettings);
    response.correctness.should.eql("correct");
    response.score.should.eql(1);

    response = server.respond(_.cloneDeep(component), ["1,1", "0,0"], defaultSettings);
    response.correctness.should.eql("incorrect");
    response.score.should.eql(0);
  });

  it('respects order doesnt matter', function() {
    var clone = _.cloneDeep(component);
    clone.model.config.labelsType = "absent";
    clone.model.config.orderMatters = false;

    var response = server.respond(clone, ["0,0", "1,1"], defaultSettings);
    response.correctness.should.eql("correct");
    response.score.should.eql(1);

    response = server.respond(clone, ["1,1", "0,0"], defaultSettings);
    response.correctness.should.eql("correct");
    response.score.should.eql(1);
  });

  it('gives default feedback if feedback type is default', function() {
    var response = server.respond(_.cloneDeep(component), ["0,0", "1,1"], defaultSettings);
    response.feedback.should.eql(fbu.keys.DEFAULT_CORRECT_FEEDBACK);

    response = server.respond(_.cloneDeep(component), ["2,2", "1,1"], defaultSettings);
    response.feedback.should.eql(fbu.keys.DEFAULT_INCORRECT_FEEDBACK);
  });

  it('gives no feedback if feedback type is none', function() {
    var clone = _.cloneDeep(component);
    clone.feedback.correctFeedbackType = "none";
    clone.feedback.incorrectFeedbackType = "none";

    var response = server.respond(clone, ["0,0", "1,1"], defaultSettings);
    should(response.feedback).not.be.ok;

    response = server.respond(clone, ["2,2", "1,1"], defaultSettings);
    should(response.feedback).not.be.ok;
  });

  it('gives custom feedback if feedback type is custom', function() {
    var clone = _.cloneDeep(component);
    clone.feedback.correctFeedbackType = "custom";
    clone.feedback.correctFeedback = "CustomCorrect";

    clone.feedback.incorrectFeedbackType = "custom";
    clone.feedback.incorrectFeedback = "CustomIncorrect";

    var response = server.respond(clone, ["0,0", "1,1"], defaultSettings);
    response.feedback.should.eql("CustomCorrect");

    response = server.respond(clone, ["2,2", "1,1"], defaultSettings);
    response.feedback.should.eql("CustomIncorrect");
  });

});