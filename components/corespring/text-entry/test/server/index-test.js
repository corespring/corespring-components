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

    server.isEqual(s1, s2, false, false).should.equal(true);
  });

  it('strict comparison should be false if they differ in case', function() {
    var s1 = "The little cow";
    var s2 = "the little COW";

    server.isEqual(s1, s2, false, false).should.equal(false);
  });

  it('strict comparison should be false if they differ in whitespace', function() {
    var s1 = "The little cow";
    var s2 = "The    little   cow";

    server.isEqual(s1, s2, false, false).should.equal(false);
  });

  it('comparison should be true if they differ in case and ignoreCase is true', function() {
    var s1 = "The little cow";
    var s2 = "the little COW";

    server.isEqual(s1, s2, true, false).should.equal(true);
  });

  it('comparison should be true if they differ in whitespace and ignoreWhitespace is true', function() {
    var s1 = "The little cow";
    var s2 = "The    little   cow";

    server.isEqual(s1, s2, false, true).should.equal(true);
  });

});

describe('text entry server logic', function() {
  var expected, response;
  var component = {
    componentType: "corespring-text-entry",
    correctResponses: {
      values: ["carrot", "apple"],
      award: 100,
      ignoreWhitespace: true,
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
      ignoreWhitespace: true,
      ignoreCase: false
    },
    model: {
      config: {}
    }
  };

  it('should return a warning outcome for an empty answer', function() {
    var outcome = server.createOutcome(_.cloneDeep(component), null, helper.settings(true, true, true));
    var expected = {
      correctness: "warning",
      score: 0,
      feedback: {
        correctness: "warning",
        message: "You did not enter a response."
      }
    };
    outcome.should.eql(expected);
    outcome.score.should.eql(expected.score);
  });

  it('should respond with correct and score 1 if the answer is correct', function() {
    response = server.createOutcome(_.cloneDeep(component), "carrot", helper.settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.equal(expected.correctness);
    response.score.should.equal(expected.score);
  });

  it('should respond with correct and score 1 if the answer is correct and whitespace/case are ignored', function() {
    var component2 = _.cloneDeep(component);
    component2.correctResponses.ignoreWhitespace = true;
    component2.correctResponses.ignoreCase = true;
    response = server.createOutcome(component2, "caR Rot", helper.settings(false, true, true));
    expected = {
      correctness: "correct",
      score: 1
    };
    response.correctness.should.equal(expected.correctness);
    response.score.should.equal(expected.score);
  });

  it('should respond with partial and score 0.25 if the answer is among partially correct ones', function() {
    response = server.createOutcome(_.cloneDeep(component), "lemon", helper.settings(false, true, true));
    expected = {
      correctness: "partial",
      score: 0.25
    };
    response.correctness.should.equal(expected.correctness);
    response.score.should.equal(expected.score);
  });

  it('should respond with incorrect and score 0 if the answer is incorrect', function() {
    response = server.createOutcome(_.cloneDeep(component), "salami", helper.settings(false, true, true));
    expected = {
        correctness: "incorrect",
        score: 0
    };
    response.correctness.should.equal(expected.correctness);
    response.score.should.equal(expected.score);
  });

  describe('with only one correct value', function() {

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

    var response;

    beforeEach(function(){
      response = server.createOutcome(_.cloneDeep(component), "15", helper.settings(true, true, true));
    });

    it('should return correct', function() {
      response.correctness.should.equal(expected.correctness);
    });

    it('should return score 1 if the answer is correct', function() {
      response.score.should.equal(expected.score);
    });

    it('should return correct for feedback correctness', function(){
      response.feedback.correctness.should.equal('correct');
    });
  });

  describe('partial feedback logic', function(){

    var comp =  {
      weight : 1,
      componentType : "corespring-text-entry",
      model : {
        answerBlankSize : 15,
        answerAlignment : "left"
      },
      feedback : {
        correctFeedbackType : "default",
        incorrectFeedbackType : "default"
      },
      correctResponses : {
        award : 100,
        values : [
            "4.37"
        ],
        ignoreWhitespace : true,
        ignoreCase : true,
        feedback : {
            type : "default"
        }
      },
      incorrectResponses : {
        award : 0,
        feedback : {
            type : "default"
        }
      },
      partialResponses : {
        award : 0,
        values : [ "4.3", "4"],
        feedback : {
            type : "default"
        }
      }
    };

    var response;

    beforeEach(function(){
        response = server.createOutcome(_.cloneDeep(comp), "4", helper.settings(true, true, true));
    });

    it('should return partial for feedback correctness', function(){
        response.feedback.correctness.should.equal('partial');
    });
  });
});