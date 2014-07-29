var assert, server, settings, should, _;

server = require('../../src/server');
assert = require('assert');
should = require('should');
var helper = require('../../../../../test-lib/test-helper');

_ = require('lodash');

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
    correctResponses: {
      values: ["carrot", "apple"],
      award: 100,
      ignoreWhitespace: false,
      ignoreCase: false
    },
    incorrectResponses: {
      feedback: {
        value: 'wrong'
      }
    },
    partialResponses: {
      values: ["lemon", "orange"],
      award: 25,
      ignoreWhitespace: false,
      ignoreCase: false
    },
    model: {
      config: {}
    }
  };

  it('should return an incorrect outcome for an empty answer', function() {
    var outcome = server.respond(_.cloneDeep(component), null, helper.settings(true, true, true));
    var expected = {
      correctness: "incorrect",
      score: 0,
      feedback: {
        correctness: "incorrect",
        message: "wrong"
      }
    };
    outcome.should.eql(expected);
  });

  it('should respond with correct and score 1 if the answer is correct', function() {
    response = server.respond(_.cloneDeep(component), "carrot", helper.settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with correct and score 1 if the answer is correct and whitespace/case are ignored', function() {
    var component2 = _.cloneDeep(component);
    component2.correctResponses.ignoreWhitespace = true;
    component2.correctResponses.ignoreCase = true;
    response = server.respond(component2, "caR Rot", helper.settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with incorrect and score 0.25 if the answer is among partially correct ones', function() {
    response = server.respond(_.cloneDeep(component), "lemon", helper.settings(false, true, true));
    expected = {
      correctness: "incorrect",
      score: 0.25
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  it('should respond with incorrect and score 0 if the answer is incorrect', function() {
    response = server.respond(_.cloneDeep(component), "salami", helper.settings(false, true, true));
    expected = {
      correctness: "incorrect",
      score: 0
    };
    response.correctness.should.eql(expected.correctness);
    response.score.should.eql(expected.score);
  });

  describe('with only one correct value', function() {
    it('should return correct and score 1 if the answer is correct', function() {
      var component = {
        "weight": 1,
        "componentType": "corespring-text-entry",
        "model": {
          "answerBlankSize": 8,
          "answerAlignment": "left"
        },
        "correctResponses": {
          "award": 100,
          "values": "15",
          "ignoreWhitespace": true,
          "ignoreCase": true,
          "feedback": {
            "type": "default"
          }
        },
        "incorrectResponses": {
          "award": 0,
          "feedback": {
            "type": "default"
          }
        }
      };

      var expected = {
        correctness: "correct",
        score: 1
      };
      var response = server.respond(_.cloneDeep(component), "15", helper.settings(false, true, true));

      response.correctness.should.eql(expected.correctness);
      response.score.should.eql(expected.score);
    });
  });


});