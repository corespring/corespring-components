var assert, component, server, settings, should, _, helper;

helper = require('../../../../../test-lib/test-helper');

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-inline-choice",
  model: {
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
  feedback: [
    {
      value: "apple",
      feedback: "Huh?"
    },
    {
      value: "carrot",
      feedbackType: "default"
    },
    {
      value: "banana",
      feedbackType: "default"
    }
  ]
};

describe('inline-choice server logic', function() {

  helper.assertNullOrUndefinedAnswersReturnsIncorrect(server, 'respond', server.DEFAULT_INCORRECT_FEEDBACK);

  describe('is correct', function() {
    server.isCorrect("1", "1").should.eql(true);
    server.isCorrect("1", "2").should.eql(false);
  });

  describe('respond', function() {

    it('should not show any feedback', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), "apple", helper.settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.should.eql(expected);
    });

    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), "carrot", helper.settings(true, true, true));
      expected = {
        correctness: "correct",
        score: 1,
        feedback: {
          "carrot": {
            feedbackType: "default",
            feedback: server.defaultFeedbacks.correct,
            correct: true
          }
        }
      };
      response.should.eql(expected);
    });

    it('should respond to an incorrect response (show correct too)', function() {
      var response = server.respond(_.cloneDeep(component), "apple", helper.settings(true, true, true));
      var expected = {
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


    it('should respond to an incorrect response (do not show correct too)', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), "apple", helper.settings(true, true, false));
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

    it('should respond to an incorrect response with default feedback if feedbackType is default', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), "banana", helper.settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          "banana": {
            feedbackType: "default",
            feedback: server.defaultFeedbacks.incorrect,
            correct: false
          }
        }
      };
      response.should.eql(expected);
    });

  });
});
