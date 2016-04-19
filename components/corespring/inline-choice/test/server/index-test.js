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
          value: "mc_1"
        },
        {
          label: "carrot",
          value: "mc_2"
        },
        {
          label: "banana",
          value: "mc_3"
        },
        {
          label: "lemon",
          value: "mc_4"
        }
      ]
    },
    correctResponse: ["mc_2", "mc_3"],
    feedback: [
      {
        value: "mc_1",
        feedback: "Huh?"
      },
      {
        value: "mc_2",
        feedbackType: "default"
      },
      {
        value: "mc_3",
        feedbackType: "default"
      },
      {
        value: "mc_4",
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
    server.isCorrect(questionWithCorrectResponse(["1"]), "1").should.equal(true);
    server.isCorrect(questionWithCorrectResponse(["1","2"]), "2").should.equal(true);
    server.isCorrect(questionWithCorrectResponse(["1","2"]), "3").should.equal(false);
  });

  describe('defaultFeedback', function(){
    it('should return default feedback for correct answer', function(){
      var model = createModel();
      model.feedback[1].feedbackType = "some feedback type";
      model.feedback[1].feedback = "some feedback";
      var fb = server.defaultFeedback( model, 'mc_2');
      fb.should.equal("Correct!");
    });
    it('should return default feedback for incorrect answer', function(){
      var fb = server.defaultFeedback(createModel(), 'mc_1');
      fb.should.equal('Good try, but carrot is the correct answer.');
    });
  });

  describe('createOutcome', function() {

    it('should not show any feedback', function() {
      var expected, response;
      response = server.createOutcome(createModel(), "mc_1", helper.settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.should.eql(expected);
    });

    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.createOutcome(createModel(), "mc_2", helper.settings(true, true, true));
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
      response = server.createOutcome(createModel(), "mc_3", helper.settings(true, true, true));
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
      var response = server.createOutcome(createModel(), "mc_1", helper.settings(true, true, true));
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
      response = server.createOutcome(createModel(), "mc_1", helper.settings(true, true, false));
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
        response = server.createOutcome(createModel(), "mc_4", helper.settings(true, true, false));
        expected = {
          correctness: "incorrect",
          score: 0,
          feedback: {
            feedbackType: "default",
            correct: false
          }
        };
        response.feedback.feedback.should.match(/Good try, but <div class="correct-response-placeholder">(carrot|banana)<\/div> is the correct answer./);
        delete response.feedback.feedback;

        response.should.eql(expected);
      }
    );
  });
});
