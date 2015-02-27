var server;

var _ = require('lodash');
var fbu = require('../../../server-shared/src/server/feedback-utils');
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});

describe('drag-and-drop-inline-v201', function () {

  var utils = null;

  describe("should return correct", function () {

    function assertCorrect(correctResponse, answers) {
      var question = {
        correctResponse: _.cloneDeep(correctResponse)
      };
      var answer = _.cloneDeep(answers);
      var settings = {};
      var outcome = server.respond(question, answer, settings);

      outcome.should.eql({
        correctness: "correct",
        correctResponse: _.cloneDeep(correctResponse),
        answer: _.cloneDeep(answers),
        score: 1,
        correctClass: "correct"
      });
    }

    it("with one correct answer", function () {
      assertCorrect({aa_1: ['c_1']}, {aa_1: ['c_1']});
    });

    it("with two same correct answers", function () {
      assertCorrect({aa_1: ['c_1', 'c_1']}, {aa_1: ['c_1', 'c_1']});
    });

    it("with two different correct answers", function () {
      assertCorrect({aa_1: ['c_1', 'c_2']}, {aa_1: ['c_1', 'c_2']});
    });

    it("with two different correct answers in wrong order", function () {
      assertCorrect({aa_1: ['c_1', 'c_2']}, {aa_1: ['c_2', 'c_1']});
    });

    it("with two areas", function () {
      assertCorrect({aa_1: ['c_1'], aa_2: ['c_2']}, {aa_1: ['c_1'], aa_2: ['c_2']});
    });

  });

  describe("should return incorrect", function () {

    function assertIncorrect(correctResponse, answers, correctClass) {
      var question = {
        correctResponse: _.cloneDeep(correctResponse)
      };
      var answer = _.cloneDeep(answers);
      var settings = {};
      var outcome = server.respond(question, answer, settings);

      outcome.should.eql({
        correctness: "incorrect",
        correctResponse: _.cloneDeep(correctResponse),
        answer: _.cloneDeep(answers),
        score: 0,
        correctClass: correctClass
      });
    }

    it("without answer", function () {
      assertIncorrect({aa_1: ['c_1']}, {aa_1: []}, "warning");
    });

    it("with one incorrect answer", function () {
      assertIncorrect({aa_1: ['c_1']}, {aa_1: ['c_2']}, "incorrect");
    });

    it("with one superfluous answer", function () {
      assertIncorrect({aa_1: ['c_1']}, {aa_1: ['c_1','c_2']}, "partial");
    });

    it("with one of two expected answers", function () {
      assertIncorrect({aa_1: ['c_1', 'c_2']}, {aa_1: ['c_1']}, "partial");
    });

    it("with one of two expected answers", function () {
      assertIncorrect({aa_1: ['c_1', 'c_2']}, {aa_1: ['c_2']}, "partial");
    });

    it("with one of two expected answers", function () {
      assertIncorrect({aa_1: ['c_1', 'c_1']}, {aa_1: ['c_1']}, "partial");
    });

    it("with one correct and one incorrect", function () {
      assertIncorrect({aa_1: ['c_1', 'c_1']}, {aa_1: ['c_1', 'c_2']}, "partial");
    });

    it("with one correct and one incorrect", function () {
      assertIncorrect({aa_1: ['c_1', 'c_2']}, {aa_1: ['c_1', 'c_1']}, "partial");
    });

    it("with two incorrect answers", function () {
      assertIncorrect({aa_1: ['c_1', 'c_2']}, {aa_1: ['c_3', 'c_4']}, "incorrect");
    });

    it("with two areas and one incorrect", function () {
      assertIncorrect({aa_1: ['c_1'], aa_2: ['c_2']}, {aa_1: ['c_1'], aa_2: ['c_4']}, "partial");
    });

    it("with two areas and two incorrect", function () {
      assertIncorrect({aa_1: ['c_1'], aa_2: ['c_2']}, {aa_1: ['c_3'], aa_2: ['c_4']}, "incorrect");
    });

  });


  it('should return incorrect + feedback for an empty answer', function () {
    var outcome = server.respond({
        feedback: {}
      },
      null, {
        showFeedback: true
      });

    outcome.should.eql({
      correctness: 'incorrect',
      score: 0,
      correctResponse: null,
      correctClass: 'warning',
      answer: null,
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
    });
  });


  it('should return incorrect + feedback for an empty answer when using custom feedback', function () {
    var outcome = server.respond({
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
      correctResponse: null,
      correctClass: 'warning',
      answer: null,
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
    });
  });

});