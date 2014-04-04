var assert, server, settings, should, _;

server = require('../../src/server');
assert = require('assert');
should = require('should');

_ = require('lodash');

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
  var expected, response;
  var component = {
    componentType: "corespring-text-entry",
    correctResponse: {values:["carrot", "apple"], award: 100, ignoreWhitespace: false, ignoreCase: false},
    partialResponse: {values:["lemon", "orange"], award: 25, ignoreWhitespace: false, ignoreCase: false},
    model: {
      config: {
      }
    }
  };

  it('should respond with correct and score 1 if the answer is correct', function() {
    response = server.respond(_.cloneDeep(component), "carrot", settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with correct and score 1 if the answer is correct and whitespace/case are ignored', function() {
    var component2 = _.cloneDeep(component);
    component2.correctResponse.ignoreWhitespace = true;
    component2.correctResponse.ignoreCase = true;
    response = server.respond(component2, "caR Rot", settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with correct and score 0.25 if the answer is among partially correct ones', function() {
    response = server.respond(_.cloneDeep(component), "lemon", settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 0.25
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with incorrect and score 0 if the answer is incorrect', function() {
    response = server.respond(_.cloneDeep(component), "salami", settings(false, true, true));
    expected = {
      correctness: "incorrect",
      score: 0
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });


});
