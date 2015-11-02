/*jshint expr: true*/
var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');
var helper = require('../../../../../test-lib/test-helper');
var _ = require('lodash');
var assert = require('assert');
var should = require('should');
var sinon = require('sinon');

var defaultSettings = helper.settings(true, true, false);

describe('corespring:multiple-line:server', function() {
  var serverObj = {
    expressionize: _.identity,
    isFunctionEqual: function(e1, e2, options) {
      return e1 === e2;
    }
  };

  var server = proxyquire('../../src/server', {
    'corespring.function-utils.server': serverObj,
    'corespring.server-shared.server.feedback-utils': fbu
  });



  var component = {
    "title": "Graph Multiple Lines",
    "componentType": "corespring-multiple-line",
    "minimumWidth": 500,
    "correctResponse": [
      {
        "id": 1,
        "equation": "4x",
        "label": "Line 1"
      },
      {
        "id": 2,
        "equation": "x + 2",
        "label": "Line 2"
      }
    ],
    "allowPartialScoring": false,
    "partialScoring": [],
    "feedback": {
      "correctFeedbackType": "default",
      "partialFeedbackType": "default",
      "incorrectFeedbackType": "default",
      "correctFeedback": "<div>Correct</div>",
      "partialFeedback": "<div>Partial</div>",
      "incorrectFeedback": "<div>Wrong</div>"
    },
    "model": {
      "config": {
        "lines": [
          {
            "id": 1,
            "equation": "4x",
            "intialLine": "4x+1",
            "label": "Line 1",
            "colorIndex": 0
          },
          {
            "id": 2,
            "equation": "x + 2",
            "intialLine": "x + 2",
            "label": "Line 2",
            "colorIndex": 1
          }
        ],
        "exhibitOnly": false,
        "graphWidth": 500,
        "graphHeight": 500,
        "domainLabel": "x",
        "domainMin": -10,
        "domainMax": 10,
        "domainStepValue": 1,
        "domainLabelFrequency": 1,
        "domainGraphPadding": 50,
        "rangeLabel": "y",
        "rangeMin": -10,
        "rangeMax": 10,
        "rangeStepValue": 1,
        "rangeLabelFrequency": false,
        "rangeGraphPadding": 50,
        "sigfigs": -1,
        "showCoordinates": true,
        "showInputs": true,
        "showFeedback": true,
        "rangeSnapValue": 1,
        "domainSnapValue": 1,
        "domainSnapFrequency": 1,
        "rangeSnapFrequency": 1,
        "showAxisLabels": true
      }
    }
  };

  var correctResponse = [
    {
      "id": 1,
      "equation": "4x",
      "label": "Line 1"
    },
    {
      "id": 2,
      "equation": "x + 2",
      "label": "Line 2"
    }
  ];

  var correctAnswer = [
    {
      id: 1,
      equation: "4x",
      name: "Line 1"
    },
    {
      id: 2,
      equation: "x + 2",
      name: "Line 2"
    }
  ];

  var incorrectAnswer = [
    {
      id: 1,
      equation: "2x",
      name: "Line 1"
    },
    {
      id: 2,
      equation: "x + 1",
      name: "Line 2"
    }
  ];

  var partiallyCorrectAnswer = [
    {
      id: 1,
      equation: "4x",
      name: "Line 1"
    },
    {
      id: 2,
      equation: "x + 1",
      name: "Line 2"
    }
  ];

  var emptyAnswer = [
    {
      id: 1,
      equation: "",
      name: "Line 1"
    },
    {
      id: 2,
      equation: "",
      name: "Line 2"
    }
  ];

  var partiallyEmptyAnswer = [
    {
      id: 1,
      equation: "2x",
      name: "Line 1"
    },
    {
      id: 2,
      equation: "",
      name: "Line 2"
    }
  ];

  var unorderedAnswer = [
    {
      id: 1,
      equation: "x + 2",
      name: "Line 1"
    },
    {
      id: 2,
      equation: "4x",
      name: "Line 2"
    }
  ];

  describe('server correctness logic', function() {

    it('should return warning outcome for an empty answer', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), emptyAnswer, defaultSettings);
      outcome.should.eql({
        correctness: 'warning',
        score: 0,
        feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
      });
    });

    it('should process a partially empty answer, but empty lines are marked as incorrect', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), partiallyEmptyAnswer, helper.settings(true, true, true));
      outcome.should.eql({
        correctness: 'incorrect',
        score: 0,
        correctClass: "incorrect",
        correctResponse: [
          {
            id: 1,
            label: "Line 1",
            equation: "4x",
            expression: "4x",
            isCorrect: false
          },
          {
            id: 2,
            label: "Line 2",
            equation: "x + 2",
            expression: "x + 2",
            isCorrect: false
          }
        ],
        feedback: fbu.keys.DEFAULT_INCORRECT_FEEDBACK
      });
    });

    it('should respond with correct and score 1 if the answer is correct', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), correctAnswer, defaultSettings);
      outcome.correctness.should.eql("correct");
      outcome.score.should.eql(1);
      outcome.correctClass.should.eql("correct");
    });

    it('should respond with incorrect and score 0 if the answer is incorrect', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), incorrectAnswer, helper.settings(true, true, true));
      outcome.correctness.should.eql("incorrect");
      outcome.score.should.eql(0);
      outcome.correctClass.should.eql("incorrect");
    });

    it('should respond with incorrect and score 0 if the answer is in incorrect order', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), unorderedAnswer, helper.settings(true, true, true));
      outcome.correctness.should.eql("incorrect");
      outcome.score.should.eql(0);
      outcome.correctClass.should.eql("incorrect");
    });

    it('should respond with partial and score 0 if the answer is partially correct, but partial scoring is disabled', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), partiallyCorrectAnswer, helper.settings(true, true, true));
      outcome.correctness.should.eql("partial");
      outcome.score.should.eql(0);
      outcome.correctClass.should.eql("partial");
    });

    it('should respond with partial and score 0.5 if the answer is partially correct and partial scoring is enabled', function() {
      var partialAllowedComponent = _.cloneDeep(component);
      partialAllowedComponent.allowPartialScoring = true;
      partialAllowedComponent.partialScoring = [{
        numberOfCorrect: 1,
        scorePercentage: 50
      }];
      var outcome = server.createOutcome(_.cloneDeep(partialAllowedComponent), partiallyCorrectAnswer, helper.settings(true, true, true));
      outcome.correctness.should.eql("partial");
      outcome.score.should.eql(0.5);
      outcome.correctClass.should.eql("partial");
    });

    it('should call isFunctionEqual with the right parameters when creating an outcome', function() {
      var spy = sinon.spy(serverObj, 'isFunctionEqual');
      var outcome = server.createOutcome(_.cloneDeep(component), incorrectAnswer, helper.settings(true, true, true));
      spy.getCall(0).args[2].should.eql({
        variable: 'x',
        sigfigs: 3
      });
    });
  });

  describe('feedback', function() {

    it('gives default feedback if feedback type is default', function() {
      var clone = _.cloneDeep(component);
      var outcome = server.createOutcome(clone, correctAnswer, defaultSettings);
      outcome.feedback.should.eql(fbu.keys.DEFAULT_CORRECT_FEEDBACK);

      outcome = server.createOutcome(clone, incorrectAnswer, defaultSettings);
      outcome.feedback.should.eql(fbu.keys.DEFAULT_INCORRECT_FEEDBACK);

      outcome = server.createOutcome(clone, partiallyCorrectAnswer, defaultSettings);
      outcome.feedback.should.eql(fbu.keys.DEFAULT_PARTIAL_FEEDBACK);

      clone.allowPartialScoring = true;

      outcome = server.createOutcome(clone, partiallyCorrectAnswer, defaultSettings);
      outcome.feedback.should.eql(fbu.keys.DEFAULT_PARTIAL_FEEDBACK);
    });

    it('gives no feedback if feedback type is none', function() {
      var clone = _.cloneDeep(component);
      clone.feedback.correctFeedbackType = "none";
      clone.feedback.incorrectFeedbackType = "none";
      clone.feedback.partialFeedbackType = "none";

      var outcome = server.createOutcome(clone, correctAnswer, defaultSettings);
      should(outcome.feedback).not.be.ok;

      outcome = server.createOutcome(clone, incorrectAnswer, defaultSettings);
      should(outcome.feedback).not.be.ok;

      outcome = server.createOutcome(clone, partiallyCorrectAnswer, defaultSettings);
      should(outcome.feedback).not.be.ok;

      clone.allowPartialScoring = true;

      outcome = server.createOutcome(clone, partiallyCorrectAnswer, defaultSettings);
      should(outcome.feedback).not.be.ok;
    });

    it('gives custom feedback if feedback type is custom', function() {
      var clone = _.cloneDeep(component);
      clone.feedback.correctFeedbackType = "custom";
      clone.feedback.correctFeedback = "CustomCorrect";

      clone.feedback.incorrectFeedbackType = "custom";
      clone.feedback.incorrectFeedback = "CustomIncorrect";

      clone.feedback.partialFeedbackType = "custom";
      clone.feedback.partialFeedback = "CustomPartial";

      var outcome = server.createOutcome(clone, correctAnswer, defaultSettings);
      outcome.feedback.should.eql("CustomCorrect");

      outcome = server.createOutcome(clone, incorrectAnswer, defaultSettings);
      outcome.feedback.should.eql("CustomIncorrect");

      outcome = server.createOutcome(clone, partiallyCorrectAnswer, defaultSettings);
      outcome.feedback.should.eql("CustomPartial");

      clone.allowPartialScoring = true;

      outcome = server.createOutcome(clone, partiallyCorrectAnswer, defaultSettings);
      outcome.feedback.should.eql("CustomPartial");
    });

  });

  describe('user response feedback', function() {

    it('should not return a correctResponse for an empty answer', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), emptyAnswer, defaultSettings);
      should(outcome.correctResponse).not.be.ok;
    });

    it('should return incorrect for every empty lines in a partially empty answer', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), partiallyEmptyAnswer, helper.settings(true, true, true));
      outcome.correctResponse.should.eql(
        [
          {
            id: 1,
            label: "Line 1",
            equation: "4x",
            expression: "4x",
            isCorrect: false
          },
          {
            id: 2,
            label: "Line 2",
            equation: "x + 2",
            expression: "x + 2",
            isCorrect: false
          }
        ]
      );
    });

    it('should return correct for every line when the answer is correct', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), correctAnswer, defaultSettings);
      outcome.correctResponse.should.eql(
        [
          {
            id: 1,
            label: "Line 1",
            equation: "4x",
            expression: "4x",
            isCorrect: true
          },
          {
            id: 2,
            label: "Line 2",
            equation: "x + 2",
            expression: "x + 2",
            isCorrect: true
          }
        ]
      );
    });

    it('should respond with incorrect for every line when the answer is incorrect', function() {
      var outcome = server.createOutcome(_.cloneDeep(component), incorrectAnswer, helper.settings(true, true, true));
      outcome.correctResponse.should.eql(
        [
          {
            id: 1,
            label: "Line 1",
            equation: "4x",
            expression: "4x",
            isCorrect: false
          },
          {
            id: 2,
            label: "Line 2",
            equation: "x + 2",
            expression: "x + 2",
            isCorrect: false
          }
        ]
      );
    });

    it('should respond with corerct for every correct line no matter if partial scoring is disabled or enabled', function() {
      var clone = _.cloneDeep(component);
      var outcome = server.createOutcome(clone, partiallyCorrectAnswer, helper.settings(true, true, true));
      outcome.correctResponse.should.eql(
        [
          {
            id: 1,
            label: "Line 1",
            equation: "4x",
            expression: "4x",
            isCorrect: true
          },
          {
            id: 2,
            label: "Line 2",
            equation: "x + 2",
            expression: "x + 2",
            isCorrect: false
          }
        ]
      );

      clone.allowPartialScoring = true;

      outcome = server.createOutcome(clone, partiallyCorrectAnswer, helper.settings(true, true, true));
      outcome.correctResponse.should.eql(
        [
          {
            id: 1,
            label: "Line 1",
            equation: "4x",
            expression: "4x",
            isCorrect: true
          },
          {
            id: 2,
            label: "Line 2",
            equation: "x + 2",
            expression: "x + 2",
            isCorrect: false
          }
        ]
      );
    });

  });
});