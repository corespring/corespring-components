var assert, component, server, settings, should, _;

_ = require('lodash');

var proxyquire = require('proxyquire').noCallThru();

var mockFnUtils = {
  expressionize: _.identity,
  isFunctionEqual: function(e1, e2, options) {
    return e1 === e2;
  }
};

server = proxyquire('../../src/server', {
  'corespring.function-utils.server': mockFnUtils
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


settings = function(feedback, userResponse, correctResponse) {
  feedback = feedback === undefined ? true : feedback;
  userResponse = userResponse === undefined ? true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};

describe('equation entry server logic', function() {

  it('should respond with correct and score 1 if the answer is correct', function() {
    var expected, response;
    response = server.respond(_.cloneDeep(component), "y=2x+4", settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with incorrect and score 0 if the answer is incorrect', function() {
    var expected, response;
    response = server.respond(_.cloneDeep(component), "y=3x+2", settings(false, true, true));
    expected = {
      correctness: "incorrect",
      score: 0
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });



});
