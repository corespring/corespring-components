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
    },
    "objects": []
  }
};

var correctAnswer = [
  {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
  {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"},
  {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
];


describe.only('number line', function() {

  describe('correctness', function() {

    it('should return an incorrect outcome for an empty answer', function() {
      var outcome = server.respond(component, null, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("incorrect");
    });

    it('should return incorrect outcome if point element is incorrect', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 1, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"},
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];

      var outcome = server.respond(component, answer, helper.settings(true, true, true));

      expect(outcome).to.have.property("correctness").eql("incorrect");
    });

    it('should return incorrect outcome if domainPosition of line element is incorrect', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 3, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"},
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("incorrect");
    });

    it('should return incorrect outcome if size of line element is incorrect', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 4, "leftPoint": "full", "rightPoint": "empty"},
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("incorrect");
    });

    it('should return incorrect outcome if point types of line element is incorrect', function() {
      //Left Point
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "empty", "rightPoint": "empty"},
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("incorrect");

      //Right Point
      answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "full"},
        {"type": "ray", "pointType": "full", "domainPosition": 4, "direction": "negative"}
      ];
      outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("incorrect");
    });

    it('should return incorrect outcome if element type is missing', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"},
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"}
      ];
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("incorrect");
    });

    it('should return incorrect outcome if element is missing', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"}
      ];
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("incorrect");
    });

    it('should return correct outcome if answer is correct', function() {
      var answer = correctAnswer;
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("correct");
    });

  });

  describe('feedback', function() {
    it('correct elements should have isCorrect true in feedback', function() {
      var answer = correctAnswer;
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(_.every(outcome.feedback, function(fb) {
        return fb.isCorrect;
      })).to.be.true;
    });

    it('incorrect elements should have isCorrect false in feedback', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"},
        {"type": "ray", "pointType": "full", "domainPosition": 2, "direction": "negative"}
      ];
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome.feedback[0].isCorrect).to.be.true;
      expect(outcome.feedback[1].isCorrect).to.be.true;
      expect(outcome.feedback[2].isCorrect).to.be.false;
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
        {"type": "line", "domainPosition": 2, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"},
        {"type": "ray", "pointType": "full", "domainPosition": 2, "direction": "negative"}
      ];
      var outcome = server.respond(_component, answer, helper.settings(true, true, true));
      expect(outcome.feedback[0].isCorrect).to.be.true;
      expect(outcome.feedback[1].isCorrect).to.be.true;
      expect(outcome.feedback[2].isCorrect).to.be.false;
    });
  });

  describe('score', function() {
    it('score should be 0 if answer is incorrect', function() {
      var answer = [
        {"type": "point", "pointType": "empty", "domainPosition": 3, "rangePosition": 1},
        {"type": "line", "domainPosition": 1, "rangePosition": 2, "size": 2, "leftPoint": "full", "rightPoint": "empty"}
      ];
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("score").eql(0);
    });

    it('score should be 1 if answer is correct', function() {
      var answer = correctAnswer;
      var outcome = server.respond(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("score").eql(1);
    });
  });
});