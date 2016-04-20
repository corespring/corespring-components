var assert, component, server, settings, should, _, helper;

helper = require('../../../../../test-lib/test-helper');

//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu,
  'corespring.scoring-utils.server': {}
});

assert = require('assert');
should = require('should');
_ = require('lodash');

component = {
  componentType: "corespring-multiple-choice",
  model: {
    config: {
      orientation: "vertical",
      shuffle: true,
      choiceType: "checkbox"
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
        label: "turnip",
        value: "turnip"
      },
      {
        label: "pear",
        value: "pear"
      }
    ]
  },
  allowPartialScoring: false,
  correctResponse: {
    value: ["carrot", "turnip", "pear"]
  },
  feedback: [
    {
      value: "apple",
      feedback: "Huh?"
    },
    {
      value: "carrot",
      feedback: "Yes",
      notChosenFeedback: "Carrot is a veggie"
    },
    {
      value: "turnip",
      feedback: "Yes",
      notChosenFeedback: "Turnip is a veggie"
    },
    {
      value: "pear",
      feedback: "pear",
      notChosenFeedback: "Pear is a veggie"
    }
  ]
};


describe('multiple-choice server logic', function() {

  it('should return warning if the answer is null or undefined', function() {
    var outcome = server.createOutcome({
        correctResponse: {
          value: ['a']
        },
        feedback: [
          {
            value: 'a',
            feedback: 'yes',
            notChosenFeedback: 'no'
          }
        ]
      },
      null,
      helper.settings(true, true, true)
    );
    outcome.should.eql({
      correctness: 'warning',
      score: 0,
      feedback: {
        emptyAnswer: true,
        message: fbu.keys.DEFAULT_WARNING_FEEDBACK
      }
    });
    outcome.score.should.equal(0);
  });


  describe('is correct', function() {
    server.isCorrect(["1"], ["1"], true).should.equal(true);
    server.isCorrect(["1", "2"], ["1"], true).should.equal(false);
    server.isCorrect(["1"], ["1", "2"], false).should.equal(false);
    server.isCorrect(["1", "2"], ["1"], false).should.equal(false);
  });

  describe('createOutcome', function() {
    it('should not show any feedback', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple"], helper.settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.correctness.should.equal(expected.correctness);
      response.score.should.equal(expected.score);
    });

    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["carrot", "turnip", "pear"], helper.settings(true, true, true));
      expected = {
        correctness: "correct",
        score: 1,
        feedback: [
          {
            value: "carrot",
            feedback: "Yes",
            correct: true
          },
          {
            value: "turnip",
            feedback: "Yes",
            correct: true
          },
          {
            value: "pear",
            feedback: "pear",
            correct: true
          }
        ]
      };
      response.correctness.should.equal(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.equal(expected.score);
    });

    it('should respond to an incorrect response (show correct too)', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple"], helper.settings(true, true, true));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: [
          {
            value: "carrot",
            feedback: "Carrot is a veggie",
            correct: true
          },
          {
            value: "turnip",
            feedback: "Turnip is a veggie",
            correct: true
          },
          {
            value: "pear",
            feedback: "Pear is a veggie",
            correct: true
          },
          {
            value: "apple",
            feedback: "Huh?",
            correct: false
          }
        ]
      };
      response.correctness.should.equal(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.equal(expected.score);
    });


    it('should respond to an incorrect response (do not show correct too)', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple"], helper.settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: [
          {
            value: "apple",
            feedback: "Huh?",
            correct: false
          }
        ]
      };
      response.correctness.should.equal(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.equal(expected.score);
    });


    it('should respond to an incorrect response and show feedback for 1 incorrect and 1 correct', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple", "carrot"], helper.settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: [
          {
            value: "apple",
            feedback: "Huh?",
            correct: false
          },
          {
            value: "carrot",
            feedback: "Yes",
            correct: true
          }
        ]
      };
      response.correctness.should.equal(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.equal(expected.score);
    });

    it('should show empty feedback if no feedback is defined', function() {
      var noFeedbackComponent = _.cloneDeep(component);
      delete noFeedbackComponent.feedback;

      var response = server.createOutcome(noFeedbackComponent, ["apple", "carrot"], helper.settings(true, true, false));
      var expected = {
        correctness: "incorrect",
        score: 0,
        feedback: [
          {
            value: "apple",
            correct: false
          },
          {
            value: "carrot",
            correct: true
          }
        ],
        comments: undefined
      };
      response.should.eql(expected);
    });

    it('in partially correct case', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["carrot", "turnip", "pear"], helper.settings(true, true, true));
      expected = {
        correctness: "correct",
        score: 1,
        feedback: [
          {
            value: "carrot",
            feedback: "Yes",
            correct: true
          },
          {
            value: "turnip",
            feedback: "Yes",
            correct: true
          },
          {
            value: "pear",
            feedback: "pear",
            correct: true
          }
        ]
      };
      response.correctness.should.equal(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.equal(expected.score);
    });

  });

  describe('Preprocessing', function() {
    var preprocessComponent = {
      componentType: 'corespring-multiple-choice',
      correctResponse: {
        value: ['1']
      },
      model: {
        config: {},
        choices: [
          {
            label: 'a',
            value: '1'
          },
          {
            label: 'b',
            value: '2'
          }
        ]
      }
    };

    it('should add choiceType if none present', function() {

      var json = server.preprocess(preprocessComponent);
      json.model.config.choiceType.should.not.eql(undefined);
    });

  });

  describe('scoring', function() {
    var comp, response;

    beforeEach(function() {
      comp = {
        "weight": 1,
        "correctResponse": {
          "value": [
            "mc_1", "mc_2"
          ]
        },
        "allowPartialScoring": false,
        "partialScoring": [
          {
            "numberOfCorrect": 1,
            "scorePercentage": 25
          }
        ],
        "feedback": [
          {
            "value": "mc_1",
            "feedbackType": "none",
            "notChosenFeedbackType": "none"
          },
          {
            "value": "mc_2",
            "feedbackType": "none",
            "notChosenFeedbackType": "none"
          },
          {
            "value": "mc_3",
            "feedbackType": "none",
            "notChosenFeedbackType": "none"
          }
        ],
        "model": {
          "choices": [
            {
              "label": "one",
              "value": "mc_1",
              "labelType": "text"
            },
            {
              "label": "two",
              "value": "mc_2",
              "labelType": "text"
            },
            {
              "label": "three",
              "value": "mc_3",
              "labelType": "text"
            }
          ],
          "config": {
            "orientation": "vertical",
            "shuffle": false,
            "choiceType": "checkbox",
            "choiceLabels": "letters",
            "showCorrectAnswer": "separately"
          },
          "scoringType": "standard"
        }
      };
    });

    function createOutcome(answer) {
      response = server.createOutcome(comp, answer, helper.settings(true, true, false));
    }

    describe('choiceType checkbox', function() {

      beforeEach(function() {
        comp.model.config.choiceType = "checkbox";
      });

      describe('without partial scoring', function() {
        it('should return score 1, when answer is complete', function() {
          createOutcome(["mc_1", "mc_2"]);
          response.correctness.should.equal('correct');
          response.score.should.equal(1);
        });
        it('should return score 0, when answer is incomplete', function() {
          createOutcome(["mc_2"]);
          response.correctness.should.equal('incorrect');
          response.score.should.equal(0);
        });
        it('should return score 0, when answer is wrong', function() {
          createOutcome(["mc_3"]);
          response.correctness.should.equal('incorrect');
          response.score.should.equal(0);
        });
        it('should return score 0, when answer is complete but contains incorrect answer', function() {
          createOutcome(["mc_1", "mc_2", "mc_3"]);
          response.correctness.should.equal('incorrect');
          response.score.should.equal(0);
        });
      });

      describe('with partial scoring', function() {
        beforeEach(function() {
          comp.allowPartialScoring = true;
        });
        it('should return score 1, when answer is complete', function() {
          createOutcome(["mc_1", "mc_2"]);
          response.correctness.should.equal('correct');
          response.score.should.equal(1);
        });
        it('should return partial score 0.25, when answer is incomplete', function() {
          createOutcome(["mc_2"]);
          response.correctness.should.equal('incorrect');
          response.score.should.equal(0.25);
        });
        it('should return score 0, when answer is wrong', function() {
          createOutcome(["mc_3"]);
          response.correctness.should.equal('incorrect');
          response.score.should.equal(0);
        });
        it('should return score 0, when answer is complete but contains incorrect answer', function() {
          createOutcome(["mc_1", "mc_2", "mc_3"]);
          response.correctness.should.equal('incorrect');
          response.score.should.equal(0);
        });
      });
    });

    describe('choiceType radio', function() {

      beforeEach(function() {
        comp.model.config.choiceType = "radio";
      });

      describe('without partial scoring', function() {
        it('should return score 1, when answer is correct', function() {
          createOutcome(["mc_1"]);
          response.correctness.should.equal('correct');
          response.score.should.equal(1);
        });
        it('should return score 1, when other answer is correct', function() {
          createOutcome(["mc_2"]);
          response.correctness.should.equal('correct');
          response.score.should.equal(1);
        });
        it('should return score 0, when answer is wrong', function() {
          createOutcome(["mc_3"]);
          response.correctness.should.equal('incorrect');
          response.score.should.equal(0);
        });
      });

      describe('with partial scoring', function() {
        beforeEach(function() {
          comp.allowPartialScoring = true;
        });
        it('should return score 1, when answer is correct', function() {
          createOutcome(["mc_1"]);
          response.correctness.should.equal('correct');
          response.score.should.equal(1);
        });
        it('should return score 1, when other answer is correct', function() {
          createOutcome(["mc_2"]);
          response.correctness.should.equal('correct');
          response.score.should.equal(1);
        });
        it('should return score 0, when answer is wrong', function() {
          createOutcome(["mc_3"]);
          response.correctness.should.equal('incorrect');
          response.score.should.equal(0);
        });
      });
    });
  });
});