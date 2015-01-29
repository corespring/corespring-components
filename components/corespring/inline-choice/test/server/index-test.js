var assert, component, server, settings, should, _, helper;

helper = require('../../../../../test-lib/test-helper');

var fbu = require('../../../server-shared/src/server/feedback-utils');
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});

assert = require('assert');

should = require('should');

_ = require('lodash');

function createModel() {
  return {
    componentType: "corespring-inline-choice",
    model: {
      config: {
        shuffle: true
      },
      choices: [
        {
          label: "apple",
          value: "apple"
        },
        {
          label: "carrot",
          value: "carrot"
        },
        {
          label: "banana",
          value: "banana"
        },
        {
          label: "lemon",
          value: "lemon"
        }
      ]
    },
    correctResponse: ["carrot", "banana"],
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
      },
      {
        value: "lemon",
        feedbackType: "default"
      }
    ]
  };
}



describe('inline-choice server logic', function() {

  helper.assertNullOrUndefinedAnswersReturnsIncorrect(server, 'createOutcome', server.DEFAULT_INCORRECT_FEEDBACK);

  describe('isCorrect', function() {
    function questionWithCorrectResponse(correctResponse){
      return {correctResponse:correctResponse};
    }
    server.isCorrect(questionWithCorrectResponse(["1"]), "1").should.eql(true);
    server.isCorrect(questionWithCorrectResponse(["1","2"]), "2").should.eql(true);
    server.isCorrect(questionWithCorrectResponse(["1","2"]), "3").should.eql(false);
  });

  describe('defaultFeedback', function(){
    it('should return default feedback for correct answer', function(){
      var model = createModel();
      model.feedback[1].feedbackType = "some feedback type";
      model.feedback[1].feedback = "some feedback";
      var fb = server.defaultFeedback(  model, 'carrot');
      fb.should.eql("Correct!");
    });
    it('should return default feedback for incorrect answer', function(){
      var fb = server.defaultFeedback(createModel(), 'apple');
      fb.should.eql("Good try, but carrot is the correct answer.");
    });
  });

  describe('createOutcome', function() {

    it('should not show any feedback', function() {
      var expected, response;
      response = server.createOutcome(createModel(), "apple", helper.settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.should.eql(expected);
    });

    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.createOutcome(createModel(), "carrot", helper.settings(true, true, true));
      expected = {
        correctness: "correct",
        score: 1,
        feedback: {
          feedbackType: "default",
          feedback: server.defaults.correct,
          correct: true
        }
      };
      response.should.eql(expected);
    });

    it('should respond to a second correct answer', function() {
      var expected, response;
      response = server.createOutcome(createModel(), "banana", helper.settings(true, true, true));
      expected = {
        correctness: "correct",
        score: 1,
        feedback: {
          feedbackType: "default",
          feedback: server.defaults.correct,
          correct: true
        }
      };
      response.should.eql(expected);
    });

    it('should respond to an incorrect response (show correct too)', function() {
      var response = server.createOutcome(createModel(), "apple", helper.settings(true, true, true));
      var expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          feedback: "Huh?",
          correct: false
        }
      };
      response.should.eql(expected);
    });


    it('should respond to an incorrect response (do not show correct too)', function() {
      var expected, response;
      response = server.createOutcome(createModel(), "apple", helper.settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          feedback: "Huh?",
          correct: false
        }
      };
      response.should.eql(expected);
    });

    it('should respond to an incorrect response with random correct answer in default feedback if feedbackType is default',
      function() {
        var expected, response;
        response = server.createOutcome(createModel(), "lemon", helper.settings(true, true, false));
        expected = {
          correctness: "incorrect",
          score: 0,
          feedback: {
            feedbackType: "default",
            correct: false
          }
        };
        response.feedback.feedback.should.match(/Good try, but (carrot|banana) is the correct answer./);
        delete response.feedback.feedback;

        response.should.eql(expected);
      }
    );
  });
});
