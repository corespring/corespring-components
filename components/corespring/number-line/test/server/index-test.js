/* jshint -W024 */
/* jshint expr:true */

var fbu, assert, component, server, settings, should, _, helper, shared, helper, proxyquire;

proxyquire = require('proxyquire').noCallThru();
helper = require('../../../../../test-lib/test-helper');

fbu = require('../../../server-shared/src/server/feedback-utils');

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});

assert = require('assert');

var expect = require('chai').expect;

_ = require('lodash');

component = {
  "componentType": "corespring-number-line",
  "title": "Number Line",
  "weight": 1,
  "allowPartialScoring": false,
  "correctResponse": [
    {
      "type": "point",
      "pointType": "empty",
      "domainPosition": 3
    },
    {
      "type": "line",
      "domainPosition": 2,
      "size": 2,
      "leftPoint": "full",
      "rightPoint": "empty"
    },
    {
      "type": "ray",
      "domainPosition": 4,
      "pointType": "full",
      "direction": "negative"
    }
  ],
  "model": {
    "config": {
      "domain": [0, 20],
      "maxNumberOfPoints": 3,
      "tickFrequency": 20,
      "snapPerTick": 2,
      "initialType": "PF"
    }
  }
};

var correctAnswer = [
  {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
  {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"},
  {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
];


describe('number line', function() {

  describe('empty response warning', function() {
    it('should respond with warning when empty response is given', function() {
      var outcome = server.createOutcome(component, [], helper.settings(true, true, true));

      expect(outcome).to.eql({
        "correctness": "warning",
        "correctClass": "warning",
        "score": 0,
        "feedback": {
          "correctness": "warning",
          "message": "You did not enter a response."
        }
      });
      outcome.score.should.equal(0);
    });
  });

  describe('correctness', function() {

    it('should return a warning outcome for an empty answer', function() {
      var outcome = server.createOutcome(component, null, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("warning");
    });

    it('should return incorrect outcome if point element is incorrect', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {
          "type": "line",
          "domainPosition": 1,
          "rangePosition": 2,
          "size": 2,
          "leftPoint": "full",
          "rightPoint": "empty"
        },
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];

      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));

      expect(outcome).to.have.property("correctness").equal("incorrect");
    });

    it('should return incorrect outcome if domainPosition of line element is incorrect', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {
          "type": "line",
          "domainPosition": 3,
          "rangePosition": 2,
          "size": 2,
          "leftPoint": "full",
          "rightPoint": "empty"
        },
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").equal("incorrect");
    });

    it('should return incorrect outcome if size of line element is incorrect', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {
          "type": "line",
          "domainPosition": 2,
          "rangePosition": 2,
          "size": 4,
          "leftPoint": "full",
          "rightPoint": "empty"
        },
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").equal("incorrect");
    });

    it('should return incorrect outcome if point types of line element is incorrect', function() {
      //Left Point
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {
          "type": "line",
          "domainPosition": 2,
          "rangePosition": 2,
          "size": 2,
          "leftPoint": "empty",
          "rightPoint": "empty"
        },
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").equal("incorrect");

      //Right Point
      answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "full"},
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];
      outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").equal("incorrect");
    });

    it('should return incorrect outcome if element type is missing', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {
          "type": "line",
          "domainPosition": 2,
          "rangePosition": 2,
          "size": 2,
          "leftPoint": "full",
          "rightPoint": "empty"
        },
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").equal("incorrect");
    });

    it('should return incorrect outcome if element is missing', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").equal("incorrect");
    });

    it('should return correct outcome if answer is correct', function() {
      var answer = correctAnswer;
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").equal("correct");
    });

  });

  describe('feedback', function() {

    it('incorrect item has incorrect feedback message and class', function() {
      var outcome = server.createOutcome(component, [{
        "type": "point",
        "pointType": "empty",
        "domainPosition": 1,
        "rangePosition": 1
      }], helper.settings(true, true, true));
      expect(outcome.feedback.message).to.eql(fbu.keys.DEFAULT_INCORRECT_FEEDBACK);
      expect(outcome.correctness).to.eql('incorrect');
      expect(outcome.correctClass).to.eql('incorrect');
    });

    it('correct item has correct feedback message and class', function() {
      var outcome = server.createOutcome(component, correctAnswer, helper.settings(true, true, true));
      expect(outcome.feedback.message).to.eql(fbu.keys.DEFAULT_CORRECT_FEEDBACK);
      expect(outcome.correctness).to.eql('correct');
      expect(outcome.correctClass).to.eql('correct');
    });

    it('partially correct item has partial feedback message and class', function() {
      var partiallCorrectAnswer = _.cloneDeep(correctAnswer);
      partiallCorrectAnswer[0].domainPosition = 10;
      var outcome = server.createOutcome(component, partiallCorrectAnswer, helper.settings(true, true, true));
      expect(outcome.feedback.message).to.eql(fbu.keys.DEFAULT_PARTIAL_FEEDBACK);
      expect(outcome.correctness).to.eql('incorrect');
      expect(outcome.correctClass).to.eql('partial');
    });

    it('correct elements should have isCorrect true in feedback', function() {
      var answer = correctAnswer;
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      var predicate = _.every(outcome.feedback.elements, function(fb) {
        return fb.isCorrect;
      });
      expect(predicate).to.equal(true);

    });

    it('incorrect elements should have isCorrect false in feedback', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {
          "type": "line",
          "domainPosition": 2,
          "rangePosition": 2,
          "size": 2,
          "leftPoint": "full",
          "rightPoint": "empty"
        },
        {"type": "ray", "pointType": "full", "domainPosition": 2, "direction": "negative"}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome.feedback.elements[0].isCorrect).to.be.true;
      expect(outcome.feedback.elements[1].isCorrect).to.be.true;
      expect(outcome.feedback.elements[2].isCorrect).to.be.false;
    });

    it('incorrect elements should have isCorrect false in feedback #2', function() {
      var _component = _.cloneDeep(component);

      _component.correctResponse = [
        {
          "type": "point",
          "pointType": "empty",
          "domainPosition": 3
        },
        {
          "type": "line",
          "domainPosition": 2,
          "size": 2,
          "leftPoint": "full",
          "rightPoint": "empty"
        }
      ];
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {
          "type": "line",
          "domainPosition": 2,
          "rangePosition": 2,
          "size": 2,
          "leftPoint": "full",
          "rightPoint": "empty"
        },
        {"type": "ray", "pointType": "full", "domainPosition": 2, "direction": "negative"}
      ];
      var outcome = server.createOutcome(_component, answer, helper.settings(true, true, true));
      expect(outcome.feedback.elements[0].isCorrect).to.be.true;
      expect(outcome.feedback.elements[1].isCorrect).to.be.true;
      expect(outcome.feedback.elements[2].isCorrect).to.be.false;
    });
  });

  describe('normal scoring', function() {
    it('score should be 0 if answer is incorrect', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 1, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("score").equal(0);
    });

    it('score should be 1 if answer is correct', function() {
      var answer = correctAnswer;
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("score").equal(1);
    });
  });

  describe('partial scoring', function() {
    var pComponent;
    beforeEach(function() {
      pComponent = _.merge(_.cloneDeep(component), {
        allowPartialScoring: true,
        "partialScoring": [
          {numberOfCorrect: 1, scorePercentage: 20}
        ]
      });
    });

    it('score should be percentage if answer is partially correct', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 1, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"}
      ];

      var outcome = server.createOutcome(pComponent, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("score").equal(0.2);
    });

    it('score should be 0 if answer is incorrect', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 2, "rangePosition": 1},
        {"type": "line", "domainPosition": 1, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"}
      ];

      var outcome = server.createOutcome(pComponent, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("score").equal(0);
    });

    it('score should be 1 if answer is incorrect', function() {
      var outcome = server.createOutcome(pComponent, correctAnswer, helper.settings(true, true, true));
      expect(outcome).to.have.property("score").equal(1);
    });
  });
});