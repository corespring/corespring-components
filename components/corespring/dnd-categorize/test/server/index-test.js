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

  function Question() {
    var value = {
      correctResponse: {},
      allowPartialScoring: false,
      partialScoring: {
        sections: []
      },
      allowWeighting: false,
      weighting: {},
      model: {
        categories: []
      }
    };

    this.withCategories = function(categories) {
      value.model.categories = _.map(categories, function(id) {
        return {
          id: id,
          label: 'label-' + id
        };
      });
      return this;
    };

    this.withCorrectResponse = function(correctResponse) {
      value.correctResponse = _.cloneDeep(correctResponse);
      return this;
    };

    this.withPartialScoring = function(allow, sections) {
      value.allowPartialScoring = allow;
      value.partialScoring = {
        sections: sections
      };
      return this;
    };

    this.withWeighting = function(allow, weighting) {
      value.allowWeighting = allow;
      value.weighting = weighting;
      return this;
    };

    this.getValue = function() {
      return _.cloneDeep(value);
    };
  }

  function question(categories, correctResponse) {
    return new Question()
      .withCategories(categories)
      .withCorrectResponse(correctResponse)
      .getValue();
  }

  function partialScoring(sections) {
    return {
      sections: sections
    };
  }

  function answers(o) {
    return o;
  }

  function outcome(o) {
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

      if (warningClass) {
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

  describe("partial scoring", function() {

    function assertPartial(question, partialScoring, answers, expectedOutcome) {
      var answer = _.cloneDeep(answers);
      var settings = {};
      question.allowPartialScoring = true;
      question.partialScoring = partialScoring;
      var outcome = server.createOutcome(question, answer, settings);
      outcome.should.eql(expectedOutcome);
    }


    it('one of two answers correct', function() {
      assertPartial(
        question(
          ['aa_1'], {
            aa_1: ['c_1', 'c_2']
          }),
        partialScoring(
            [{
            catId: 'aa_1',
            partialScoring: [
              {
                numberOfCorrect: 1,
                scorePercentage: 10
              }
              ]
            }]
        ),
        answers({
          aa_1: ['c_1']
        }),
        outcome({
          correctness: 'incorrect',
          correctClass: 'partial',
          score: 0.1,
          correctResponse: {
            aa_1: ['c_1', 'c_2']
          },
          detailedFeedback: detailedFeedback({
            aa_1: {
              correctness: ['correct']
            }
          })
        }));
    });

    it('two of two answers correct', function() {
      assertPartial(
        question(
          ['aa_1'], {
            aa_1: ['c_1', 'c_2']
          }),
        partialScoring(
          [{
            catId: 'aa_1',
            partialScoring: [
              {
                numberOfCorrect: 1,
                scorePercentage: 10
              }
            ]
          }]
        ),
        answers({
          aa_1: ['c_1', 'c_2']
        }),
        outcome({
          correctness: 'correct',
          correctClass: 'correct',
          score: 1,
          detailedFeedback: detailedFeedback({
            aa_1: {
              correctness: ['correct', 'correct']
            }
          })
        })
      );
    });

    it('1 of 2 and 1 of 1 answers correct', function() {
      assertPartial(
        question(
          ['aa_1', 'aa_2'], {
            aa_1: ['c_1', 'c_2'],
            aa_2: ['c_1']
          }),
        partialScoring(
          [{
              catId: 'aa_1',
              partialScoring: [
                {
                  numberOfCorrect: 1,
                  scorePercentage: 10
              }
            ]
          },
            {
              catId: 'aa_2',
              partialScoring: [
                {
                  numberOfCorrect: 1,
                  scorePercentage: 0
              }
            ]
          }]
        ),
        answers({
          aa_1: ['c_1'],
          aa_2: ['c_1']
        }),
        outcome({
          correctness: 'incorrect',
          correctClass: 'partial',
          score: 0.55,
          correctResponse: {
            aa_1: ['c_1', 'c_2'],
            aa_2: ['c_1']
          },
          detailedFeedback: detailedFeedback({
            aa_1: {
              correctness: ['correct']
            },
            aa_2: {
              correctness: ['correct']
            }
          })
        })
      );
    });

  });

  it('should return incorrect + feedback for an empty answer', function() {
    var outcome = server.createOutcome({
        partialScoring: {
          sections: []
        },
        model: {
          categories: []
        },
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
      partialScoring: {
        sections: []
      },
      model: {
        categories: []
      },
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

  describe('weighting', function() {

    function weightedScore(answer, allowed, weighting) {
      var settings = {};
      var question = new Question()
        .withCategories(['aa_1', 'aa_2'])
        .withCorrectResponse({
          aa_1: ['c_1', 'c_2'],
          aa_2: ['c_1', 'c_2']
        })
        .withPartialScoring(true, [{
          catId: 'aa_1',
          partialScoring: [
            {
              numberOfCorrect: 1,
              scorePercentage: 50
            }
          ]
        },
          {
            catId: 'aa_2',
            partialScoring: [
              {
                numberOfCorrect: 1,
                scorePercentage: 50
              }
            ]
          }
        ])
        .withWeighting(allowed, weighting)
        .getValue();

      var outcome = server.createOutcome(question, answer, settings);
      return outcome.score;
    }

    describe('correct answer', function() {
      var correctAnswer;

      beforeEach(function(){
        correctAnswer = {
          aa_1: ['c_1', 'c_2'],
          aa_2: ['c_1', 'c_2']
        };
      });

      it('should return 1, if weighting is not allowed', function() {
        weightedScore(correctAnswer, false, {}).should.equal(1);
      });

      it('should return 1, if weighting is allowed but not configured', function() {
        weightedScore(correctAnswer, true, {}).should.equal(1);
      });

      it('should return 1, if weighting is allowed and configured to equal weights', function() {
        weightedScore(correctAnswer, true, {
          aa_1: 5,
          aa_2: 5
        }).should.equal(1);
      });

      it('should return 1, if weighting is allowed and configured to different weights', function() {
        weightedScore(correctAnswer, true, {
          aa_1: 3,
          aa_2: 7
        }).should.equal(1);
      });
    });
    describe('partially correct answer', function() {
      var answer;

      beforeEach(function(){
        answer = {
          aa_1: ['c_1', 'c_2'], //correct
          aa_2: ['c_1']         //half correct
        };
      });

      it('should return .75, if weighting is not allowed', function() {
        weightedScore(answer, false, {}).should.equal(0.75);
      });

      it('should return .75, if weighting is allowed but not configured', function() {
        weightedScore(answer, true, {}).should.equal(0.75);
      });

      it('should return .75, if weighting is allowed and configured to equal weights', function() {
        weightedScore(answer, true, {
          aa_1: 10,
          aa_2: 10
        }).should.equal(0.75);
      });

      it('should return 1, if weighting is allowed and configured to different weights', function() {
        weightedScore(answer, true, {
          aa_1: 9,
          aa_2: 1
        }).should.equal(0.95);
      });
    });
  });

});