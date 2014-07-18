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

  describe('is correct', function() {
    server.isCorrect(["1"], ["1"]).should.eql(true);
    server.isCorrect(["1", "2"], ["1"]).should.eql(false);
    server.isCorrect(["1"], ["1", "2"]).should.eql(false);
  });

  describe('respond', function() {
    it('should not show any feedback', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple"], settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.correctness.should.eql(expected.correctness);
      response.score.should.eql(expected.score);
    });


    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["carrot", "turnip"], settings(true, true, true));
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
      response.score.should.eql(expected.score);
    });

    it('should respond to an incorrect response (show correct too)', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple"], settings(true, true, true));
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
      response.score.should.eql(expected.score);
    });


    it('should respond to an incorrect response (do not show correct too)', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple"], settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          apple: "shouldNotHaveBeenSelected"
        }
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });



    it('should respond to an incorrect response and show feedback for 1 incorrect and 1 correct', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple", "carrot"], settings(true, true, false));
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
      response.score.should.eql(expected.score);
    });

  });
});
