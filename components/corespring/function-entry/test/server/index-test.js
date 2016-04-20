var assert, component, server, settings, should, _, helper;

_ = require('lodash');
helper = require('../../../../../test-lib/test-helper');
var proxyquire = require('proxyquire').noCallThru();

var fbu = require('../../../server-shared/src/server/feedback-utils');

var mockFnUtils = {
  expressionize: _.identity,
  isEquationCorrect: function(e1, e2, options) {
    return e1 === e2;
  }
};

server = proxyquire('../../src/server', {
  'corespring.function-utils.server': mockFnUtils,
  'corespring.server-shared.server.feedback-utils' : fbu
});

assert = require('assert');

should = require('should');

component = {
  componentType: "corespring-function-entry",
  correctResponse: {
    equation: "2x+4"
  },
  model: {
    config: {
    }
  }
};



describe('function entry server logic', function() {

  it('should return warning outcome for empty answer', function(){

    var outcome = server.createOutcome({feedback: {}}, null, helper.settings(true, true, true));

    outcome.should.eql({
      correctness: 'warning',
      score: 0,
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK,
      outcome: ['incorrectEquation'],
      comments: undefined 
    });
    outcome.score.should.equal(0);
  });

  it('should respond with correct and score 1 if the answer is correct', function() {
    var expected, response;
    response = server.createOutcome(_.cloneDeep(component), "2x+4", helper.settings(true, true, true));
    expected = {
      correctness: "correct",
      score: 1,
      feedback: "Correct!"
    };
    response.correctness.should.equal(expected.correctness);
    response.score.should.equal(expected.score);
    response.feedback.should.eql(expected.feedback);
  });

  it('should respond with incorrect and score 0 if the answer is incorrect', function() {
    var expected, response;
    response = server.createOutcome(_.cloneDeep(component), "3x+2", helper.settings(true, true, true));
    expected = {
      correctness: "incorrect",
      score: 0,
      feedback: "Good try but the correct answer is y=2x+4"
    };
    response.correctness.should.equal(expected.correctness);
    response.score.should.equal(expected.score);
    response.feedback.should.eql(expected.feedback);
  });
});
