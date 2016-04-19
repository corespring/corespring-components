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

      outcome.should.eql({
        correctness: "correct",
        correctResponse: _.cloneDeep(correctResponse),
        answer: _.cloneDeep(answers),
        score: 1,
        correctClass: "correct",
        feedbackPerChoice: feedbackPerChoice
      });
      outcome.score.should.equal(1);
    }

    it("with one correct answer", function() {
      assertCorrect({
        aa_1: ['c_1']
      }, {
        aa_1: ['c_1']
      }, {aa_1:['correct']});
    });

    it("with two same correct answers", function() {
      assertCorrect({
        aa_1: ['c_1', 'c_1']
      }, {
        aa_1: ['c_1', 'c_1']
      }, {aa_1:['correct', 'correct']});
    });

    it("with two different correct answers", function() {
      assertCorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_1', 'c_2']
      }, {aa_1:['correct','correct']});
    });

    it("with two different correct answers in wrong order", function() {
      assertCorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_2', 'c_1']
      }, {aa_1:['correct','correct']});
    });

    it("with two areas", function() {
      assertCorrect({
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {aa_1:['correct'], aa_2:['correct']});
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
        score: 0,
        correctClass: correctClass,
        feedbackPerChoice: feedbackPerChoice
      };
      if(correctResponse !== undefined){
        expectedOutcome.correctResponse = _.cloneDeep(correctResponse);
      }        

      outcome.should.eql(expectedOutcome);
      outcome.score.should.equal(expectedOutcome.score);
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
        aa_1: ['incorrect']
      });
    });

    it("with one superfluous answer", function() {
      assertIncorrect({
        aa_1: ['c_1']
      }, {
        aa_1: ['c_1', 'c_1']
      }, "partial", {
        aa_1: ['correct', 'incorrect']
      });
    });

    it("with one of two expected answers", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_1']
      }, "partial", {
        aa_1: ['correct']
      });
    });

    it("with one of two expected answers", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_2']
      }, "partial", {
        aa_1: ['correct']
      });
    });

    it("with one of two expected answers", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_1']
      }, {
        aa_1: ['c_1']
      }, "partial", {
        aa_1: ['correct']
      });
    });

    it("with one correct and one incorrect", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_1']
      }, {
        aa_1: ['c_1', 'c_2']
      }, "partial", {
        aa_1: ['correct', 'incorrect']
      });
    });

    it("with one correct and one incorrect", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_1', 'c_1']
      }, "partial", {
        aa_1: ['correct', 'incorrect']
      });
    });

    it("with two incorrect answers", function() {
      assertIncorrect({
        aa_1: ['c_1', 'c_2']
      }, {
        aa_1: ['c_3', 'c_4']
      }, "incorrect", {
        aa_1: ['incorrect', 'incorrect']
      });
    });

    it("with two areas and one incorrect", function() {
      assertIncorrect({
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: ['c_1'],
        aa_2: ['c_4']
      }, "partial", {
        aa_1: ['correct'],
        aa_2: ['incorrect']
      });
    });

    it("with two areas and two incorrect", function() {
      assertIncorrect({
        aa_1: ['c_1'],
        aa_2: ['c_2']
      }, {
        aa_1: ['c_3'],
        aa_2: ['c_4']
      }, "incorrect", {
        aa_1: ['incorrect'],
        aa_2: ['incorrect']
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
      score: 0,
      correctClass: 'warning',
      answer: null,
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
      score: 0,
      correctClass: 'warning',
      answer: null,
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK,
      feedbackPerChoice: {}
    });
    outcome.score.should.equal(0);
  });

});