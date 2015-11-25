var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');
var server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});
var should = require('should');
var _ = require('lodash');
var helper = require('../../../../../test-lib/test-helper');

var component = {
  "componentType": "corespring-select-text",
  "correctResponse": {
    "value": [0, 2, 4]
  },
  "model": {
    "config": {
      "availability": "all",
      "selectionUnit": "word",
      "maxSelections": 0
    },
    "choices": []
  }
};

describe('select text server logic', function() {

  it('should return an incorrect outcome if answer is empty', function() {
    var outcome = server.createOutcome(_.cloneDeep(component), null, helper.settings(true, true, true));
    var expected = {
      correctness: "incorrect",
      score: 0,
      feedback: {
        choices: [],
        message: "Good try but that is not the correct answer."
      },
      outcome: [],
      correctClass: "incorrect"
    };
    outcome.should.eql(expected);
  });

  it('should respond with correct true in answer is correct', function() {
    var response = server.createOutcome(_.cloneDeep(component), [0, 2, 4], helper.settings(true, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  it('should respond with incorrect in answer is incorrect', function() {
    var response = server.createOutcome(_.cloneDeep(component), [1, 2], helper.settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
  });

  it('should have incorrect selections in the feedback', function() {
    var response = server.createOutcome(_.cloneDeep(component), [1, 3], helper.settings(true, true, true));
    response.feedback.choices[0].should.eql({
      index: 1,
      correct: false
    });
    response.feedback.choices[1].should.eql({
      index: 3,
      correct: false
    });
  });

  it('should have correct selections in the feedback', function() {
    var response = server.createOutcome(_.cloneDeep(component), [1, 2, 3], helper.settings(true, true, true));

    response.feedback.choices[0].should.eql({
      index: 1,
      correct: false
    });
    response.feedback.choices[1].should.eql({
      index: 2,
      correct: true
    });
    response.feedback.choices[2].should.eql({
      index: 3,
      correct: false
    });
  });

  it('should have correct response in the feedback', function() {
    var response = server.createOutcome(_.cloneDeep(component), [1, 2], helper.settings(true, true, true));
    response.correctResponse.should.eql([0, 2, 4]);
  });

  it('should not have correct response in the feedback, if show feedback is false', function() {
    var response = server.createOutcome(_.cloneDeep(component), [1, 2], helper.settings(false, true, true));
    response.should.not.have.property('correctResponse');
  });

  it('should not have feedback is show feedback is false', function() {
    var response = server.createOutcome(_.cloneDeep(component), ['1', '2'], helper.settings(false, true, true));
    response.should.not.have.property('feedback');
  });

});