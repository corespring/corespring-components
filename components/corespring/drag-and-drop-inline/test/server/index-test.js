var server;

var _ = require('lodash');
var fbu = require('../../../server-shared/src/server/feedback-utils');
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});

describe('drag-and-drop-inline', function() {

  var utils = null;

  describe("should return correct", function() {

    function assertCorrect(correctResponse, answers, feedbackPerChoice) {
      var question = {
        correctResponse: _.cloneDeep(correctResponse)
      };
      var answer = _.cloneDeep(answers);
      var settings = {};
      var outcome = server.createOutcome(question, answer, settings);

      outcome.correctness.should.eql("correct");
      outcome.correctResponse.should.eql(_.cloneDeep(correctResponse));
      outcome.answer.should.eql(_.cloneDeep(answers));
      outcome.score.should.eql(1);
      outcome.correctClass.should.eql("correct");
      outcome.feedbackPerChoice.should.eql(feedbackPerChoice);
      return outcome;
    }

    it("with one correct answer", function() {
      var outcome = assertCorrect({
        aa_1: ['c_1']
      }, {
        aa_1: ['c_1']
      }, {aa_1:['correct']});
      outcome.correctNum.should.eql(1);
    });

    it("with two same correct answers", function() {
      var outcome = assertCorrect({
        aa_1: ['c_1', 'c_1']
      }, {
        aa_1: ['c_1', 'c_1']
      }, {aa_1:['correct', 'correct']});
      outcome.correctNum.should.eql(2);
    });

    it("with two different correct answers", function() {
      var outcome = assertCorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_1', 'c_2']
      }, {aa_1:['correct','correct']});
      outcome.correctNum.should.eql(2);
    });

    it("with two different correct answers in wrong order", function() {
      var outcome = assertCorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_2', 'c_1']
      }, {aa_1:['correct','correct']});
      outcome.correctNum.should.eql(2);
    });

    it("with two areas", function() {
      var outcome = assertCorrect({
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {aa_1:['correct'], aa_2:['correct']});
      outcome.correctNum.should.eql(2);
    });

  });

  describe("should return incorrect", function() {

    function assertIncorrect(correctResponse, answers, correctClass, feedbackPerChoice) {
      var question = {
        correctResponse: _.cloneDeep(correctResponse)
      };
      var answer = _.cloneDeep(answers);
      var settings = {};
      var outcome = server.createOutcome(question, answer, settings);
      var expectedOutcome = {
        correctness: "incorrect",
        answer: _.cloneDeep(answers),
        correctClass: correctClass,
        feedbackPerChoice: feedbackPerChoice,
        score: 0
      };

      if (correctResponse !== undefined) {
        expectedOutcome.correctResponse = _.cloneDeep(correctResponse);
      }        

      outcome.correctness.should.eql(expectedOutcome.correctness);
      if (answer !== null) {
        outcome.answer.should.eql(expectedOutcome.answer);
      }
      outcome.correctClass.should.eql(expectedOutcome.correctClass);
      outcome.feedbackPerChoice.should.eql(expectedOutcome.feedbackPerChoice);
      outcome.score.should.equal(expectedOutcome.score);
      return outcome;
    }

    it("without answer", function() {
      assertIncorrect(undefined, null, "warning", {});
    });

    it("with one incorrect answer", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1']
      }, {
        aa_1: ['c_2']
      }, "incorrect", {
        aa_1: ['incorrect']
      });
      outcome.correctNum.should.eql(0);
    });

    it("with one superfluous answer", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1']
      }, {
        aa_1: ['c_1', 'c_1']
      }, "partial", {
        aa_1: ['correct', 'incorrect']
      });
      outcome.correctNum.should.eql(1);
    });

    it("with one of two expected answers", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_1']
      }, "partial", {
        aa_1: ['correct']
      });
      outcome.correctNum.should.eql(1);
    });

    it("with one of two expected answers", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_2']
      }, "partial", {
        aa_1: ['correct']
      });
      outcome.correctNum.should.eql(1);
    });

    it("with one of two expected answers", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1', 'c_1']
      }, {
        aa_1: ['c_1']
      }, "partial", {
        aa_1: ['correct']
      });
      outcome.correctNum.should.eql(1);
    });

    it("with one correct and one incorrect", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1', 'c_1']
      }, {
        aa_1: ['c_1', 'c_2']
      }, "partial", {
        aa_1: ['correct', 'incorrect']
      });
      outcome.correctNum.should.eql(1);
    });

    it("with one correct and one incorrect", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_1', 'c_1']
      }, "partial", {
        aa_1: ['correct', 'incorrect']
      });
      outcome.correctNum.should.eql(1);
    });

    it("with two incorrect answers", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_3', 'c_4']
      }, "incorrect", {
        aa_1: ['incorrect', 'incorrect']
      });
      outcome.correctNum.should.eql(0);
    });

    it("with two areas and one incorrect", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: ['c_1'],
        aa_2: ['c_4']
      }, "partial", {
        aa_1: ['correct'],
        aa_2: ['incorrect']
      });
      outcome.correctNum.should.eql(1);
    });

    it("with two areas and two incorrect", function() {
      var outcome = assertIncorrect({
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: ['c_3'],
        aa_2: ['c_4']
      }, "incorrect", {
        aa_1: ['incorrect'],
        aa_2: ['incorrect']
      });
      outcome.correctNum.should.eql(0);
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
      correctNum: 0,
      answer: null,
      score: 0,
      correctClass: 'warning',
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK,
      feedbackPerChoice: {}
    });
    outcome.score.should.equal(0);
  });


  it('should return incorrect + feedback for an empty answer when using custom feedback', function() {
    var outcome = server.createOutcome({
      feedback: {
        incorrectFeedbackType: 'custom',
        incorrectFeedback: 'custom no'
      }
    }, null, {
      showFeedback: true
    }, {});
    outcome.should.eql({
      correctness: 'incorrect',
      correctNum: 0,
      answer: null,
      score: 0,
      correctClass: 'warning',
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK,
      feedbackPerChoice: {}
    });
    outcome.score.should.equal(0);
  });

});