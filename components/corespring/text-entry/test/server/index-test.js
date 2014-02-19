var assert, component, server, settings, should, _;

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-text-entry",
  correctResponse: "carrot"
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

describe('text entry server logic', function() {

  it('should respond with correct and score 1 if the answer is correct', function() {
    var expected, response;
    response = server.respond(_.cloneDeep(component), "carrot", settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with incorrect and score 0 if the answer is correct', function() {
    var expected, response;
    response = server.respond(_.cloneDeep(component), "salami", settings(false, true, true));
    expected = {
      correctness: "incorrect",
      score: 0
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with correct and score 1 if the answer is among correct ones', function() {
    var component2 = {
      componentType: "corespring-text-entry",
      correctResponse: ["carrot", "apple"]
    };

    var expected, response;
    response = server.respond(_.cloneDeep(component2), "carrot", settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);

    response = server.respond(_.cloneDeep(component2), "apple", settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with incorrect and score 0 if the answer is not among correct ones', function() {
    var component2 = {
      componentType: "corespring-text-entry",
      correctResponse: ["carrot", "apple"]
    };

    var expected, response;
    response = server.respond(_.cloneDeep(component2), "salami", settings(false, true, true));
    expected = {
      correctness: "incorrect",
      score: 0
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);

  });

});
