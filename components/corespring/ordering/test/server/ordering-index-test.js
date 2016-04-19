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
  "componentType": "corespring-ordering",
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

var placementComponent = _.merge(_.cloneDeep(component), {
  correctResponse: ["4","3"],
  model: {
    config: {
      placementType: "placement"
    }
  }
});


describe('placement ordering', function() {

  it('should return a warning outcome for an empty answer', function() {

    var outcome = server.createOutcome({
      feedback: {},
      model: {
        config: {
          placementType: "placement"
        }
      }
    }, null, helper.settings(true, true, true));

    outcome.should.eql({
      correctness: "warning",
      correctResponse: [],
      answer: null,
      score: 0,
      correctClass: "warning",
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
    });
  });

  it('respond correct', function() {
    var response = server.createOutcome(_.cloneDeep(placementComponent), ["4", "3"], helper.settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.equal(1);
  });

  it('respond incorrect', function() {
    var response = server.createOutcome(_.cloneDeep(placementComponent), ["1", "2"], helper.settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.equal(0);
  });
});

describe('ordering', function() {

  it('respond correct', function() {
    var response = server.createOutcome(_.cloneDeep(component), ["1", "2", "3", "4"], helper.settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.equal(1);
  });

  it('respond incorrect', function() {
    var response = server.createOutcome(_.cloneDeep(component), ["2", "1", "4", "3"], helper.settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.equal(0);
  });

  it('respond correct when correctResponse is defined', function() {
    var mutatedComponent = _.cloneDeep(component);
    mutatedComponent.correctResponse = ["4","3","2","1"];
    var response = server.createOutcome(_.cloneDeep(mutatedComponent), ["4", "3", "2", "1"], helper.settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.equal(1);
  });

  it('respond incorrect when correctResponse is defined', function() {
    var mutatedComponent = _.cloneDeep(component);
    mutatedComponent.correctResponse = ["4","3","2","1"];
    var response = server.createOutcome(_.cloneDeep(mutatedComponent), ["1", "2", "3", "4"], helper.settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.equal(0);
  });


});
