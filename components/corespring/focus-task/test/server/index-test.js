var assert, component, server, settings, should, _;

var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.scoring-utils.server': {}
});

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-focus-task",
  model: {
    config: {
      orientation: "vertical",
      shuffle: true,
      checkIfCorrect: "yes"
    },
    choices: [
      {
        label: "apple",
        value: "apple"
      }, {
        label: "carrot",
        value: "carrot"
      }, {
        label: "turnip",
        value: "turnip"
      }
    ]
  },
  correctResponse: {
    value: ["carrot", "turnip"]
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

describe('focus-task server logic', function() {

  describe("with empty answer", function() {
    var answer, expectedOutcome, question, settings;

    beforeEach(function() {
      question = {
        correctResponse: {
          value: ['a']
        },
        model: {
          config:{}
        }
      };
      settings = {
        showFeedback: true,
        highlightCorrectResponse: true,
        highlightUserResponse: true
      };
      expectedOutcome = {
        correctness: 'incorrect',
        correctClass: 'nothing-submitted',
        score: 0,
        feedback: {
          a: 'shouldHaveBeenSelected',
          emptyAnswer: true,
          message: server.feedback.NO_ANSWER
        },
        "outcome": [
          "responsesBelowMin"
        ]
      };
    });

    it('returns an incorrect outcome for a null answer', function() {
      var answer = null;
      var outcome = server.createOutcome(question, answer, settings);
      outcome.should.eql(expectedOutcome);
    });

    it('returns an incorrect outcome, "nothing-submitted" class for an empty answer', function() {
      var answer = [];
      var outcome = server.createOutcome(question, answer, settings);
      outcome.should.eql(expectedOutcome);
    });
  });

  describe('build feedback', function() {
    it('returns an empty object', function() {
      server.buildFeedback({
        correctResponse: {
          value: ['a']
        }
      }, {}, {}, true).should.eql({emptyAnswer:true, message: server.feedback.NO_ANSWER});
    });

    it('returns only the correct response', function() {
      server.buildFeedback({
        correctResponse: {
          value: ['a']
        }
      }, {}, {
        highlightCorrectResponse: true
      }, true).should.eql({
        a: 'shouldHaveBeenSelected',
        emptyAnswer: true,
        message: server.feedback.NO_ANSWER
      });
    });

    it('returns correct and user response', function() {
      server.buildFeedback({
        correctResponse: {
          value: ['a']
        }
      }, ['b', 'c'], {
        highlightCorrectResponse: true,
        highlightUserResponse: true
      }, true).should.eql({
        a: 'shouldHaveBeenSelected',
        b: 'shouldNotHaveBeenSelected',
        c: 'shouldNotHaveBeenSelected'
      });
    });

    it('returns user response', function() {
      server.buildFeedback({
        correctResponse: {
          value: ['a']
        }
      }, ['b', 'c'], {
        highlightCorrectResponse: false,
        highlightUserResponse: true
      }, true).should.eql({
        b: 'shouldNotHaveBeenSelected',
        c: 'shouldNotHaveBeenSelected'
      });
    });

  });

  describe('is correct', function() {
    server.isCorrect(["1"], ["1"]).should.equal(true);
    server.isCorrect(["1", "2"], ["1"]).should.equal(false);
    server.isCorrect(["1"], ["1", "2"]).should.equal(false);
  });

  describe('createOutcome', function() {
    it('should not show any feedback', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple"], settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.correctness.should.eql(expected.correctness);
      response.score.should.equal(expected.score);
    });

    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["carrot", "turnip"], settings(true, true, true));
      expected = {
        correctness: "correct",
        score: 1,
        feedback: {
          carrot: 'shouldHaveBeenSelected',
          turnip: 'shouldHaveBeenSelected'
        }
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.equal(expected.score);
    });

    it('should respond to an incorrect response (show correct too)', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple"], settings(true, true, true));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          apple: "shouldNotHaveBeenSelected",
          carrot: 'shouldHaveBeenSelected',
          turnip: 'shouldHaveBeenSelected'
        }
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.equal(expected.score);
    });


    it('should respond to an incorrect response (do not show correct too)', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple"], settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          apple: "shouldNotHaveBeenSelected"
        }
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.equal(expected.score);
    });

    it('should respond to an incorrect response and show feedback for 1 incorrect and 1 correct', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple", "carrot"], settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          apple: "shouldNotHaveBeenSelected",
          carrot: 'shouldHaveBeenSelected'
        }
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.equal(expected.score);
    });

  });
});