var server;

var _ = require('lodash');
var fbu = require('../../../server-shared/src/server/feedback-utils');
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});

describe('dnd-categorize', function() {

  var utils = null;

  describe("should return correct", function() {

    function assertCorrect(correctResponse, answers, detailedFeedback) {
      var question = {
        correctResponse: _.cloneDeep(correctResponse)
      };
      var answer = _.cloneDeep(answers);
      var settings = {};
      var outcome = server.createOutcome(question, answer, settings);

      outcome.should.eql({
        correctness: "correct",
        correctClass: "correct",
        score: 1,
        detailedFeedback: detailedFeedback
      });
    }

    it("with one correct answer", function() {
      assertCorrect({
        aa_1: ['c_1']
      }, {
        aa_1: ['c_1']
      }, {
        aa_1: {
          correctness: ['correct']
        }
      });
    });

    it("with two different correct answers", function() {
      assertCorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: {correctness:['correct', 'correct']}
      });
    });

    it("with two different correct answers in wrong order", function() {
      assertCorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_2', 'c_1']
      }, {
        aa_1: {correctness:['correct', 'correct']}
      });
    });

    it("with two areas", function() {
      assertCorrect({
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: {correctness:['correct']},
        aa_2: {correctness:['correct']}
      });
    });

  });

  describe("should return incorrect", function() {

    function assertIncorrect(correctResponse, answers, correctClass, detailedFeedback) {
      var question = {
        correctResponse: _.cloneDeep(correctResponse)
      };
      var answer = _.cloneDeep(answers);
      var settings = {};
      var outcome = server.createOutcome(question, answer, settings);
      var expectedOutcome = {
        correctness: "incorrect",
        correctClass: correctClass,
        score: 0
      }

      if(correctResponse !== undefined){
        expectedOutcome.correctResponse = _.cloneDeep(correctResponse);
      }

      expectedOutcome.detailedFeedback = detailedFeedback;

      outcome.should.eql(expectedOutcome);
    }

    it("without answer", function() {
      assertIncorrect(undefined, null, "warning", {});
    });

    it("with one incorrect answer", function() {
      assertIncorrect({
        aa_1: ['c_1']
      }, {
        aa_1: ['c_2']
      }, "incorrect", {
        aa_1: {correctness:['incorrect']}
      });
    });

    it("with one superfluous answer", function() {
      assertIncorrect({
        aa_1: ['c_1']
      }, {
        aa_1: ['c_1', 'c_2']
      }, "partial", {
        aa_1: {correctness:['correct', 'incorrect']}
      });
    });

    it("with one of two expected answers", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_1']
      }, "partial", {
        aa_1: {correctness:['correct']}
      });
    });

    it("with one of two expected answers", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_2']
      }, "partial", {
        aa_1: {correctness:['correct']}
      });
    });

    it("with one correct and one incorrect", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_1', 'c_3']
      }, "partial", {
        aa_1: {correctness:['correct', 'incorrect']}
      });
    });

    it("with two incorrect answers", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_3', 'c_4']
      }, "incorrect", {
        aa_1: {correctness:['incorrect', 'incorrect']}
      });
    });

    it("with two categories and one incorrect", function() {
      assertIncorrect({
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: ['c_1'],
        aa_2: ['c_4']
      }, "partial", {
        aa_1: {correctness:['correct']},
        aa_2: {correctness:['incorrect']}
      });
    });

    it("with two categories and two incorrect", function() {
      assertIncorrect({
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: ['c_3'],
        aa_2: ['c_4']
      }, "incorrect", {
        aa_1: {correctness:['incorrect']},
        aa_2: {correctness:['incorrect']}
      });
    });

  });

  it('should return incorrect + feedback for an empty answer', function() {
    var outcome = server.createOutcome({
        feedback: {}
      },
      null, {
        showFeedback: true
      });

    outcome.should.eql({
      correctness: 'incorrect',
      correctClass: 'warning',
      score: 0,
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK,
      detailedFeedback: {}
    });
  });


  it('should return incorrect + feedback for an empty answer when using custom feedback', function() {
    var outcome = server.createOutcome({
      feedback: {
        incorrectFeedbackType: 'custom',
        incorrectFeedback: 'bad boy!'
      }
    }, null, {
      showFeedback: true
    }, {});
    outcome.should.eql({
      correctness: 'incorrect',
      correctClass: 'warning',
      score: 0,
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK,
      detailedFeedback: {}
    });
  });

});