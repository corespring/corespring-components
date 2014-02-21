var assert, component, server, settings, should, _;

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-text-entry",
  correctResponse: "carrot",
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

describe('text equality logic', function() {
  it('strict comparison should be true if they are equal', function() {
    var s1 = "The little cow";
    var s2 = "The little cow";

    server.isEqual(s1, s2, false, false).should.eql(true);
  });

  it('strict comparison should be false if they differ in case', function() {
    var s1 = "The little cow";
    var s2 = "the little COW";

    server.isEqual(s1, s2, false, false).should.eql(false);
  });

  it('strict comparison should be false if they differ in whitespace', function() {
    var s1 = "The little cow";
    var s2 = "The    little   cow";

    server.isEqual(s1, s2, false, false).should.eql(false);
  });

  it('comparison should be true if they differ in case and ignoreCase is true', function() {
    var s1 = "The little cow";
    var s2 = "the little COW";

    server.isEqual(s1, s2, true, false).should.eql(true);
  });

  it('comparison should be true if they differ in whitespace and ignoreWhitespace is true', function() {
    var s1 = "The little cow";
    var s2 = "The    little   cow";

    server.isEqual(s1, s2, false, true).should.eql(true);
  });

});

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
      correctResponse: ["carrot", "apple"],
      model: {
        config: {}
      }
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
      correctResponse: ["carrot", "apple"],
      model: {
        config: {}
      }
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
