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
  "componentType": "corespring-hotspot",
  "title": "HotSpot",
  "correctResponse": [
    {"id": "c1", "hotspot": "h1"},
    {"id": "c2", "hotspot": "h2"}
  ],
  "feedback": {
    "correctFeedbackType": "default",
    "partialFeedbackType": "default",
    "incorrectFeedbackType": "default"
  },
  "allowPartialScoring": true,
  "partialScoring": [],
  "model": {
    "choices": [
      {
        "label": "Choice 1",
        "id": "c1"
      },
      {
        "label": "Choice 2",
        "id": "c2"
      },
      {
        "label": "Choice 3",
        "id": "c3"
      }
    ],
    "hotspots": [
      {
        "id": "h1",
        "shape": "rect",
        "coords": {
          "left": 20,
          "top": 20,
          "width": 100,
          "height": 100
        }
      },
      {
        "id": "h2",
        "shape": "rect",
        "coords": {
          "left": 20,
          "top": 140,
          "width": 100,
          "height": 100
        }
      }
    ],
    "config": {
      "shuffle": true
    }
  }
};

describe.only('hotspot', function() {

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
    });
  });

  describe('correctness', function() {
    it('should return correct outcome if answer is correct', function() {
      var answer = [
        {id: "c1", left: 25, top: 25},
        {id: "c2", left: 25, top: 145}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("correct");
    });

    it('should return incorrect outcome if answer is incorrect', function() {
      var answer = [
        {id: "c1", left: 155, top: 25},
        {id: "c2", left: 155, top: 145}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("incorrect");
    });

    it('should return incorrect outcome if answer is not fully correct', function() {
      var answer = [
        {id: "c1", left: 25, top: 25},
        {id: "c2", left: 25, top: 145},
        {id: "c3", left: 25, top: 145}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome).to.have.property("correctness").eql("incorrect");
    });
  });

  describe('feedback', function() {
    it('correct answer should give correct feedback', function() {
      var answer = [
        {id: "c1", left: 25, top: 25},
        {id: "c2", left: 25, top: 145}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome.correctness).to.eql('correct');
    });

    it('incorrect answer should give incorrect feedback', function() {
      var answer = [
        {id: "c1", left: 25, top: 25},
        {id: "c2", left: 175, top: 145}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome.correctness).to.eql('incorrect');
    });

    it('should return feedback for choices', function() {
      var answer = [
        {id: "c1", left: 25, top: 25},
        {id: "c2", left: 125, top: 145}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(_.pick(outcome.feedback.choices[0],'id','isCorrect')).to.eql({id: "c1", isCorrect: true});//, {id: "c2", isCorrect: false}]);
    });
  });

  describe.only('choices belonging to multiple hotspots', function() {
    var otherComponent;
    beforeEach(function() {
      otherComponent = _.extend(component, {"correctResponse": [
        {"id": "c1", "hotspot": "h1"},
        {"id": "c1", "hotspot": "h2"}
      ]});

    });
    it('should evaluate to correct when the choice is dragged to the respective correct hotspots', function() {
      var answer = [
        {id: "c1", left: 25, top: 25},
        {id: "c1", left: 25, top: 145}
      ];
      var outcome = server.createOutcome(otherComponent, answer, helper.settings(true, true, true));
      expect(_.pluck(outcome.feedback.choices, 'id','isCorrect')).to.eql(['c1','c1']);
    });
  });

});