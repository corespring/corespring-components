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

describe('hotspot', function() {

  describe('rectangle overlapping', function () {
    it('should handle case when topleft of r2 is inside r1', function () {
      var r1 = {left: 0, top: 0, width: 100, height: 30};
      var r2 = {left: 80, top: 20, width: 100, height: 30};
      expect(server.getOverlappingRectangle(r1, r2)).to.eql({left: 80, top: 20, width: 20, height: 10});
    });

    it('should handle case when topleft of r1 is inside r2', function () {
      var r1 = {left: 5, top: 30, width: 100, height: 30};
      var r2 = {left: 0, top: 0, width: 50, height: 50};
      expect(server.getOverlappingRectangle(r1, r2)).to.eql({left: 5, top: 30, width: 45, height: 20});

    });

    it('should handle case when r1 is shifted left to r2', function () {
      var r1 = {left: 0, top: 0, width: 100, height: 100};
      var r2 = {left: 50, top: 0, width: 100, height: 100};
      expect(server.getOverlappingRectangle(r1, r2)).to.eql({left: 50, top: 0, width: 50, height: 100});
    });

    it('should handle case when r1 is shifted right to r2', function () {
      var r1 = {left: 80, top: 0, width: 100, height: 100};
      var r2 = {left: 50, top: 0, width: 100, height: 100};
      expect(server.getOverlappingRectangle(r1, r2)).to.eql({left: 80, top: 0, width: 70, height: 100});
    });

    it('should handle case when r1 is shifted down to r2', function () {
      var r1 = {left: 0, top: 0, width: 100, height: 100};
      var r2 = {left: 0, top: 20, width: 100, height: 100};
      expect(server.getOverlappingRectangle(r1, r2)).to.eql({left: 0, top: 20, width: 100, height: 80});
    });

    it('should handle case when r1 is shifted up to r2', function () {
      var r1 = {left: 0, top: 80, width: 100, height: 100};
      var r2 = {left: 0, top: 50, width: 100, height: 100};
      expect(server.getOverlappingRectangle(r1, r2)).to.eql({left: 0, top: 80, width: 100, height: 70});
    });

    it('should handle case when r1 is inside r2', function () {
      var r1 = {left: 5, top: 5, width: 30, height: 30};
      var r2 = {left: 0, top: 0, width: 50, height: 50};
      expect(server.getOverlappingRectangle(r1, r2)).to.eql({left: 5, top: 5, width: 30, height: 30});
    });

    it('should handle case when r2 is inside r1', function () {
      var r1 = {left: 0, top: 0, width: 50, height: 50};
      var r2 = {left: 5, top: 5, width: 30, height: 30};
      expect(server.getOverlappingRectangle(r1, r2)).to.eql({left: 5, top: 5, width: 30, height: 30});
    });

    it('should handle case when no overlap', function () {
      var r1 = {left: 0, top: 0, width: 50, height: 50};
      var r2 = {left: 55, top: 55, width: 30, height: 30};
      var overlap = server.getOverlappingRectangle(r1, r2);
      expect(overlap.width + overlap.height).to.eql(0);
    });
  });

  describe('point inside polygon checking', function() {
    var polygon;
    beforeEach(function() {
      polygon = [[155,2],[105,11],[84,18],[60,27],[34,41],[23,54],[15,64],[8,74],[3,87],[3,95],[3,105],[5,113],[12,126],[19,139],[31,151],[45,163],[69,177],[82,183],[93,186],[106,188],[118,192],[140,194],[159,197],[173,197],[194,196],[212,194],[229,192],[246,187],[263,183],[283,176],[298,167],[315,156],[328,141],[337,130],[345,112],[347,97],[344,79],[338,68],[333,59],[330,55],[325,50],[319,44],[308,36],[302,32],[292,27],[284,24],[274,19],[265,16],[251,13],[236,8],[227,6],[213,4],[201,2],[190,1],[173,0],[165,0],[155,2]];
    });

    it('should return true if point is inside polygon', function () {
      var isInside = server.isPointInsidePolygon([61, 27], polygon);
      expect(isInside).to.eql(true);

      isInside = server.isPointInsidePolygon([283, 171], polygon);
      expect(isInside).to.eql(true);
    });

    it('should return false if point is outside polygon', function () {
      var isInside = server.isPointInsidePolygon([60, 26], polygon);
      expect(isInside).to.eql(false);

      isInside = server.isPointInsidePolygon([288, 173], polygon);
      expect(isInside).to.eql(false);
    });
  });

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

    it('should set correctNum to the number of correct answers', function() {
      var answer = [
        {id: "c1", left: 25, top: 25},
        {id: "c2", left: 25, top: 145}
      ];
      var outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome.correctNum).to.eql(2);

      answer = [
        {id: "c1", left: 25, top: 25},
        {id: "c2", left: 5, top: 145}
      ];
      outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome.correctNum).to.eql(1);

      answer = [
        {id: "c1", left: 5, top: 25},
        {id: "c2", left: 5, top: 145}
      ];
      outcome = server.createOutcome(component, answer, helper.settings(true, true, true));
      expect(outcome.correctNum).to.eql(0);
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

  describe('choices belonging to multiple hotspots', function() {
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