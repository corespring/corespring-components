var server;

var _ = require('lodash');
var fbu = require('../../../server-shared/src/server/feedback-utils');
var proxyquire = require('proxyquire').noCallThru();
var expect = require('expect');

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});

describe('dnd-categorize', function() {

  var utils = null;

  function question(categories, correctResponse) {
    return {
      correctResponse: _.cloneDeep(correctResponse),
      model: {
        categories: _.map(categories, function(id) {
          return {
            id: id,
            label: 'label-' + id
          };
        })
      }
    };
  }

  function answers(o) {
    return o;
  }

  function detailedFeedback(o) {
    return o;
  }

  describe("should return correct", function() {

    function assertCorrect(question, answers, detailedFeedback) {
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
      assertCorrect(
        question(
          ['aa_1'], {
            aa_1: ['c_1']
          }),
        answers({
          aa_1: ['c_1']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['correct']
          }
        }));
    });

    it("with two different correct answers", function() {
      assertCorrect(
        question(
          ['aa_1'], {
            aa_1: ['c_1', 'c_2']
          }),
        answers({
          aa_1: ['c_1', 'c_2']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['correct', 'correct']
          }
        }));
    });

    it("with two different correct answers in wrong order", function() {
      assertCorrect(
        question(['aa_1'], {
          aa_1: ['c_1', 'c_2']
        }),
        answers({
          aa_1: ['c_2', 'c_1']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['correct', 'correct']
          }
        }));
    });

    it("with two areas", function() {
      assertCorrect(
        question(['aa_1', 'aa_2'], {
          aa_1: ['c_1'],
          aa_2: ['c_2']
        }),
        answers({
          aa_1: ['c_1'],
          aa_2: ['c_2']
        }), detailedFeedback({
          aa_1: {
            correctness: ['correct']
          },
          aa_2: {
            correctness: ['correct']
          }
        }));
    });

  });

  describe("should return incorrect", function() {

    function assertIncorrect(correctClass, question, answers, detailedFeedback, warningClass, dontExpectCorrectResponse) {
      var answer = _.cloneDeep(answers);
      var settings = {};
      var outcome = server.createOutcome(question, answer, settings);
      var expectedOutcome = {
        correctness: "incorrect",
        correctClass: correctClass,
        score: 0
      };

      expectedOutcome.detailedFeedback = detailedFeedback;

      if(warningClass){
        expectedOutcome.warningClass = warningClass;
      }

      if (dontExpectCorrectResponse) {
        expect(outcome.correctResponse).toBe(undefined);
      } else {
        expectedOutcome.correctResponse = _.cloneDeep(question.correctResponse);
      }

      outcome.should.eql(expectedOutcome);
    }

    it("without answer", function() {
      assertIncorrect(
        "warning",
        question([], {}),
        answers(null),
        detailedFeedback({}),
        "answer-expected",
        true);
    });

    it("with one incorrect answer", function() {
      assertIncorrect(
        "incorrect",
        question(['aa_1'], {
          aa_1: ['c_1']
        }),
        answers({
          aa_1: ['c_2']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['incorrect']
          }
        }));
    });

    it("with one superfluous answer", function() {
      assertIncorrect(
        "partial",
        question(['aa_1'], {
          aa_1: ['c_1']
        }),
        answers({
          aa_1: ['c_1', 'c_2']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['correct', 'incorrect']
          }
        }));
    });

    it("with one of two expected answers", function() {
      assertIncorrect(
        "partial",
        question(['aa_1'], {
          aa_1: ['c_1', 'c_2']
        }),
        answers({
          aa_1: ['c_1']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['correct']
          }
        }));
    });

    it("with one of two expected answers", function() {
      assertIncorrect(
        "partial",
        question(['aa_1'], {
          aa_1: ['c_1', 'c_2']
        }),
        answers({
          aa_1: ['c_2']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['correct']
          }
        }));
    });

    it("with one correct and one incorrect", function() {
      assertIncorrect(
        "partial",
        question(['aa_1'], {
          aa_1: ['c_1', 'c_2']
        }),
        answers({
          aa_1: ['c_1', 'c_3']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['correct', 'incorrect']
          }
        }));
    });

    it("with two incorrect answers", function() {
      assertIncorrect(
        "incorrect",
        question(['aa_1'], {
          aa_1: ['c_1', 'c_2']
        }),
        answers({
          aa_1: ['c_3', 'c_4']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['incorrect', 'incorrect']
          }
        }));
    });

    it("with two categories and one incorrect", function() {
      assertIncorrect(
        "partial",
        question(['aa_1', 'aa_2'], {
          aa_1: ['c_1'],
          aa_2: ['c_2']
        }),
        answers({
          aa_1: ['c_1'],
          aa_2: ['c_4']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['correct']
          },
          aa_2: {
            correctness: ['incorrect']
          }
        }));
    });

    it("with two categories and two incorrect", function() {
      assertIncorrect(
        "incorrect",
        question(['aa_1', 'aa_2'], {
          aa_1: ['c_1'],
          aa_2: ['c_2']
        }), answers({
          aa_1: ['c_3'],
          aa_2: ['c_4']
        }),
        detailedFeedback({
          aa_1: {
            correctness: ['incorrect']
          },
          aa_2: {
            correctness: ['incorrect']
          }
        }));
    });

  });

  it('should return incorrect + feedback for an empty answer', function() {
    var outcome = server.createOutcome({
        model:{categories:[]},
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
      detailedFeedback: {},
      warningClass: "answer-expected"
    });
  });


  it('should return incorrect + feedback for an empty answer when using custom feedback', function() {
    var outcome = server.createOutcome({
      model:{categories:[]},
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
      detailedFeedback: {},
      warningClass: "answer-expected"
    });
  });

});