var assert, component, server, settings, should, _, helper;

_ = require('lodash');
helper = require('../../../../../test-lib/test-helper');
var proxyquire = require('proxyquire').noCallThru();

var fbu = require('../../../server-shared/src/server/feedback-utils');

var mockFnUtils = {
  expressionize: _.identity,
  isFunctionEqual: function(e1, e2, options) {
    return e1 === e2;
  }
};

server = proxyquire('../../src/server', {
  'corespring.function-utils.server': mockFnUtils,
  'corespring.server-shared.feedback-utils' : fbu
});

assert = require('assert');

should = require('should');

component = {
  componentType: "corespring-function-entry",
  correctResponse: {
    equation: "y=2x+4"
  },
  model: {
    config: {
    }
  }
};



describe('function entry server logic', function() {

  it('should return incorrect outcome for empty answer', function(){

    var outcome = server.respond({feedback: {}}, null, helper.settings(true, true, true));

    outcome.should.eql({
      correctness: 'incorrect',
      score: 0,
      feedback: fbu.keys.DEFAULT_INCORRECT_FEEDBACK,
      outcome: ['incorrectEquation'],
      comments: undefined 
    });
  });

  it('should respond with correct and score 1 if the answer is correct', function() {
    var expected, response;
    response = server.respond(_.cloneDeep(component), "y=2x+4", helper.settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with incorrect and score 0 if the answer is incorrect', function() {
    var expected, response;
    response = server.respond(_.cloneDeep(component), "y=3x+2", helper.settings(false, true, true));
    expected = {
      correctness: "incorrect",
      score: 0
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });



});
