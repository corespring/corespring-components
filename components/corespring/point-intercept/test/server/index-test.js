var assert, component, server, settings, should, _;

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "org-tag",
  correctResponse: ""
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

describe('correctness logic', function() {
  it('when order matters', function() {
     server.isCorrect(['0,1','12,4'], ['12,4','0,1'], true).should.eql(false);
     server.isCorrect(['0,1','12,4'], ['0,1','12,4'], true).should.eql(true);
  });

  it('when order doesnt matter', function() {
     server.isCorrect(['0,1','12,4'], ['12,4','0,1'], false).should.eql(true);
     server.isCorrect(['0,9','12,4'], ['0,1','12,4'], true).should.eql(false);
  });
});

describe('server logic', function() {

  it('should respond with correct and score 1 if the answer is correct', function() {});

  it('should respond with incorrect and score 0 if the answer is correct', function() {});

});
