var assert, component, server, settings, should, _;

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-inline-choice",
  model: {
    prompt: "Which of these is a vegetable?",
    config: {
      shuffle: true
    },
    choices: [
      {
        label: "apple",
        value: "apple"
      }, {
        label: "carrot",
        value: "carrot"
      }, {
        label: "banana",
        value: "banana"
      }
    ]
  },
  correctResponse: "carrot",
  feedback: {
    "apple": {
      feedback: "Huh?"
    },
    "carrot": {
      feedback: "Yes"
    },
    "banana": {
      feedback: "Nopes"
    }
  }
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

describe('inline-choice server logic', function() {

  describe('is correct', function() {
    server.isCorrect("1", "1").should.eql(true);
    server.isCorrect("1", "2").should.eql(false);
  });

  describe('respond', function() {

    it('should not show any feedback', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), "apple", settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.should.eql(expected);
    });

    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), "carrot", settings(true, true, true));
      expected = {
        correctness: "correct",
        score: 1,
        feedback: {
          "carrot": {
            feedback: "Yes",
            correct: true
          }
        }
      };
      response.should.eql(expected);
    });

    it('should respond to an incorrect response (show correct too)', function() {
      var response = server.respond(_.cloneDeep(component), "apple", settings(true, true, true));
      var expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          "carrot": {
            feedback: "Yes",
            correct: true
          },
          "apple": {
            feedback: "Huh?",
            correct: false
          }
        }
      };
      response.should.eql(expected);
    });


    it('should respond to an incorrect response (do not show correct too)', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), "apple", settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          "apple": {
            feedback: "Huh?",
            correct: false
          }
        }
      };
      response.should.eql(expected);
    });

  });
});
