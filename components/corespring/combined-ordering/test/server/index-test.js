var fbu, assert, component, server, settings, should, _, helper, shared, helper, proxyquire;

proxyquire = require('proxyquire').noCallThru();
helper = require('../../../../../test-lib/test-helper');

fbu = require('../../../server-shared/src/server/feedback-utils');

server = proxyquire('../../src/server', {
  'corespring.drag-and-drop-engine.server': {},
  'corespring.server-shared.server.feedback-utils': fbu
});

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  "componentType": "corespring-combined-ordering",
  "title": "Butterfly Ordering",
  "model": {
    "choices": [
      {
        "id": "1",
        "label": "Pupa",
        "value": "pupa"
      },
      {
        "id": "2",
        "label": "Egg",
        "value": "egg"
      },
      {
        "id": "3",
        "label": "Larva",
        "value": "larva"
      },
      {
        "id": "4",
        "label": "Adult",
        "value": "adult"
      }
    ],
    "config": {
      "shuffle": true,
      "placementType": "inPlace"
    }
  },
  "partialScoring": [
    {
      "numberOfCorrect": 1,
      "scorePercentage": 50
    }
  ],
  "allowPartialScoring": true,
  "weight": 1
};


describe('placement ordering', function() {

  it('should return an incorrect outcome for an empty answer', function() {

    var outcome = server.respond({
      feedback: {},
      model: {
        config: {
          placementType: "placement"
        }
      }
    }, null, helper.settings(true, true, true));
    
    outcome.should.eql({
        correctness: "incorrect",
        correctResponse: undefined,
        answer: null,
        score: 0,
        correctClass: "incorrect",
        feedback: "Good try but that is not the correct answer."
      });
  });
});

describe('ordering', function() {

   it('respond incorrect', function() {
    var response = server.respond(_.cloneDeep(component), ["1", "2", "3", "4"], helper.settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  it('respond correct', function() {
    var response = server.respond(_.cloneDeep(component), ["2", "1", "4", "3"], helper.settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
  });

  it('respond partially correct', function() {
    var response = server.respond(_.cloneDeep(component), ["1", "3", "2", "4"], helper.settings(false, true, true));
    response.correctness.should.eql('partial');
    response.score.should.eql(0.5);
  });

});
