/*jshint expr: true*/

var assert, component, server, settings, should, _, helper, fbu;

helper = require('../../../../../test-lib/test-helper');

fbu = require('../../../server-shared/src/server/feedback-utils');

var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  "componentType": "corespring-ordering",
  "title": "Butterfly Ordering",
  "correctResponse": ["egg", "pupa", "larva", "adult"],
  "model": {
    "choices": [{
      "id": "1",
      "label": "Pupa",
      "value": "pupa"
    }, {
      "id": "2",
      "label": "Egg",
      "value": "egg"
    }, {
      "id": "3",
      "label": "Larva",
      "value": "larva"
    }, {
      "id": "4",
      "label": "Adult",
      "value": "adult"
    }],
    "config": {
      "shuffle": true
    },
    "correctResponse": ["2", "1", "4", "3"]
  },
  "partialScoring": [{
    "numberOfCorrect": 1,
    "scorePercentage": 50
  }],
  "allowPartialScoring": true,
  "weight": 1
};

describe('ordering server logic', function() {

  describe('build feedback message', function() {

    it('should create the default correct message', function() {
      server.feedbackMessage({}, 'correct').should.eql(fbu.keys.DEFAULT_CORRECT_FEEDBACK);
    });

    it('should create the default incorrect message', function() {
      server.feedbackMessage({}, 'incorrect').should.eql(fbu.keys.DEFAULT_INCORRECT_FEEDBACK);
    });

    it('should create the default partially correct message', function() {
      server.feedbackMessage({}, 'partial').should.eql(fbu.keys.DEFAULT_PARTIAL_FEEDBACK);
    });

    function mkCustom(s) {
      return {
        feedbackType: 'custom',
        notChosenFeedback: s
      };
    }

    var customFb = {
      correct: mkCustom('C'),
      incorrect: mkCustom('I'),
      partial: mkCustom('P')
    };

    function assertCustom(correctness, fbModel) {
      it('should create the custom ' + correctness + ' message', function() {
        server.feedbackMessage({
          model: {
            feedback: fbModel
          }
        }, correctness).should.eql(fbModel[correctness].notChosenFeedback);
      });
    }

    function assertNone(correctness, fbModel) {
      it('should create no ' + correctness + ' message', function() {
        var result = server.feedbackMessage({
          model: {
            feedback: fbModel
          }
        }, correctness) === undefined;
        result.should.be.ok;
      });
    }

    assertCustom('correct', customFb);
    assertCustom('incorrect', customFb);
    assertCustom('partial', customFb);

    var noneFb = {
      correct: {
        feedbackType: 'none'
      },
      incorrect: {
        feedbackType: 'none'
      },
      partial: {
        feedbackType: 'none'
      }
    };

    assertNone('correct', noneFb);
    assertNone('incorrect', noneFb);
    assertNone('partial', noneFb);
  });

  it('should return an incorrect outcome if the answer is empty', function() {
    var outcome = server.respond(component, null, helper.settings(true, true, true));
    outcome.should.eql({
      correctness: "incorrect",
      score: 0,
      answer: null,
      feedback: {
        responses: {
          1: {
            correct: false
          },
          2: {
            correct: false
          },
          3: {
            correct: false
          },
          4: {
            correct: false
          }
        },
        correctness: "incorrect",
        message: "Good try but that is not the correct answer."
      }
    });
  });

  it('respond incorrect', function() {
    var response = server.respond(_.cloneDeep(component), ["1", "2", "3", "4"], helper.settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
  });

  it('respond correct', function() {
    var response = server.respond(_.cloneDeep(component), ["2", "1", "4", "3"], helper.settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  it('respond partially correct', function() {
    var response = server.respond(_.cloneDeep(component), ["2", "3", "1", "4"], helper.settings(false, true, true));
    response.correctness.should.eql('partial');
    response.score.should.eql(0.5);
  });

});