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

  it('should return incorrect if the answer is null or undefined', function() {
    var outcome = server.respond(
      {
        correctResponse: {
          value: ['a']
        },
        feedback: [
          {value: 'a', feedback: 'yes', notChosenFeedback: 'no'}
        ]
      },
      null,
      helper.settings(true, true, true)
    );
    outcome.should.eql({correctness: 'incorrect', score: 0, feedback: [
      {value: 'a', feedback: 'no', correct: true}
    ]});
  });


  describe('is correct', function() {
    server.isCorrect(["1"], ["1"], true).should.eql(true);
    server.isCorrect(["1", "2"], ["1"], true).should.eql(false);
    server.isCorrect(["1"], ["1", "2"], false).should.eql(false);
  });

  describe('respond', function() {
    it('should not show any feedback', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple"], helper.settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.correctness.should.eql(expected.correctness);
      response.score.should.eql(expected.score);
    });

    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["carrot", "turnip", "pear"], helper.settings(true, true, true));
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
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });

    it('should respond to an incorrect response (show correct too)', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple"], helper.settings(true, true, true));
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
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });


    it('should respond to an incorrect response (do not show correct too)', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple"], helper.settings(true, true, false));
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
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });


    it('should respond to an incorrect response and show feedback for 1 incorrect and 1 correct', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple", "carrot"], helper.settings(true, true, false));
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
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });

    it('should show empty feedback if no feedback is defined', function() {
      var noFeedbackComponent = _.cloneDeep(component);
      delete noFeedbackComponent.feedback;

      var response = server.respond(noFeedbackComponent, ["apple", "carrot"], helper.settings(true, true, false));
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
      response = server.respond(_.cloneDeep(component), ["carrot", "turnip", "pear"], helper.settings(true, true, true));
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
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
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
        choices : [
          {
            label: 'a',
            value: '1',
            rationale: 'This should be stripped by preprocessing'
          },
          {
            label: 'b',
            value: '2',
            rationale: 'This should also be stripped by preprocessing'
          }
        ]
      }
    };

    it('should add choiceType if none present', function() {

      var json = server.preprocess(preprocessComponent);
      json.model.config.choiceType.should.not.eql(undefined);
    });

    it('should remove rationale from choices', function() {
      var json = server.preprocess(preprocessComponent);
      _.forEach(json.model.choices, function(choice) {
        (typeof choice.rationale).should.eql('undefined');
      });
    });

  });

  describe('Scoring', function() {
    describe('if no partial scoring is allowed', function() {

      it('For any incorrect answer the score should be 0', function() {
        var response = server.respond(component, ["carrot"], helper.settings(true, true, false));
        response.score.should.eql(0);

        response = server.respond(component, ["turnip", "pear"], helper.settings(true, true, false));
        response.score.should.eql(0);

        response = server.respond(component, ["apple"], helper.settings(true, true, false));
        response.score.should.eql(0);
      });

      it('If all correct answers were checked the score should be 1 ', function() {
        var response = server.respond(component, ["carrot", "turnip", "pear"], helper.settings(true, true, false));
        response.score.should.eql(1);
      });

      it('If all correct answers were checked and some incorrect ones the score should be 1', function() {
        var response = server.respond(component, ["carrot", "turnip", "pear", "apple"], helper.settings(true, true, false));
        response.score.should.eql(1);
      });

    });


    it('PE_141', function() {
      var comp = {
            "weight" : 1,
            "componentType" : "corespring-multiple-choice",
            "title" : "Multiple Choice",
            "correctResponse" : {
              "value" : [
                "mc_1",
                "mc_2",
                "mc_4"
              ]
            },
            "allowPartialScoring" : false,
            "partialScoring" : [
              {
                "numberOfCorrect" : 1,
                "scorePercentage" : 25
              }
            ],
            "feedback" : [
              {
                "value" : "mc_1",
                "feedbackType" : "none",
                "notChosenFeedbackType" : "none"
              },
              {
                "value" : "mc_2",
                "feedbackType" : "none",
                "notChosenFeedbackType" : "none"
              },
              {
                "value" : "mc_3",
                "feedbackType" : "none",
                "notChosenFeedbackType" : "none"
              },
              {
                "value" : "mc_4",
                "feedbackType" : "none",
                "notChosenFeedbackType" : "none"
              },
              {
                "value" : "mc_0",
                "feedbackType" : "default",
                "notChosenFeedbackType" : "default"
              }
            ],
            "model" : {
              "choices" : [
                {
                  "label" : "one&nbsp;",
                  "value" : "mc_1",
                  "labelType" : "text"
                },
                {
                  "label" : "two",
                  "value" : "mc_2",
                  "labelType" : "text"
                },
                {
                  "label" : "three",
                  "value" : "mc_3",
                  "labelType" : "text"
                },
                {
                  "label" : "four",
                  "value" : "mc_4",
                  "labelType" : "text"
                },
                {
                  "label" : "five",
                  "value" : "mc_0",
                  "labelType" : "text"
                }
              ],
              "config" : {
                "orientation" : "vertical",
                "shuffle" : false,
                "choiceType" : "checkbox",
                "choiceLabels" : "letters",
                "showCorrectAnswer" : "separately"
              },
              "scoringType" : "standard"
            }};

      var response = server.respond(comp, ["mc_0","mc_1","mc_3"], helper.settings(true, true, false));
      response.score.should.eql(0);
    });

    it('if partial scoring is allowed score should be calculated using it', function() {
      var comp = _.cloneDeep(component);
      comp.allowPartialScoring = true;
      comp.partialScoring = [
        {numberOfCorrect: 1, scorePercentage: 25},
        {numberOfCorrect: 2, scorePercentage: 40}
      ];
      var response = server.respond(comp, ["carrot"], helper.settings(true, true, false));
      response.score.should.eql(0.25);

      response = server.respond(comp, ["turnip", "pear"], helper.settings(true, true, false));
      response.score.should.eql(0.4);

      response = server.respond(comp, ["carrot", "turnip", "pear"], helper.settings(true, true, false));
      response.score.should.eql(1);
    });

    it('for single choice with multiple correct answer', function() {
      var comp = _.cloneDeep(component);
      comp.model.config.choiceType = "radio";
      var response = server.respond(comp, ["carrot"], helper.settings(true, true, false));
      response.score.should.eql(1);

      response = server.respond(comp, ["turnip"], helper.settings(true, true, false));
      response.score.should.eql(1);

      response = server.respond(comp, ["pear"], helper.settings(true, true, false));
      response.score.should.eql(1);
    });

    it('partial scoring is ignored for single choice', function() {
      var comp = _.cloneDeep(component);
      comp.allowPartialScoring = true;
      comp.model.config.choiceType = "radio";
      comp.partialScoring = [
        {numberOfCorrect: 1, scorePercentage: 25},
        {numberOfCorrect: 2, scorePercentage: 40}
      ];
      var response = server.respond(comp, ["carrot"], helper.settings(true, true, false));
      response.score.should.eql(1);
    });


  });
});
