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
  userResponse = userResponse === undefined ?  true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};

describe('server logic', function() {

  it('should respond with correct and score 1 if the answer is correct', function() {
  });

  it('should respond with incorrect and score 0 if the answer is correct', function() {
  });

});
