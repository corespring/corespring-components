var assert, component, server, settings, should, _, helper;

var fbu = require('../../../server-shared/src/server/feedback-utils');
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils' : fbu
});

helper = require('../../../../../test-lib/test-helper');
assert = require('assert');
should = require('should');
_ = require('lodash');

component = {
  "componentType": "corespring-drag-and-drop",
  "title": "Butterfly D&D",
  "correctResponse": {
    "1": ["egg", "pupa"],
    "2": [],
    "3": ["larva", "adult"],
    "4": []
  },
  "feedback": [
    {
      "feedback": [
        {
          "larva": "Great"
        },
        {
          "other": "Not great"
        }
      ],
      "landingPlace": "1"
    }
  ],
  "model": {
    "answerArea": "<div>A butterfly is first a <span landing-place id='1' class='inline' cardinality='ordered'></landing-place> then a <span landing-place id='2' class='inline'></landing-place> and then a <span landing-place id='3' class='inline'></landing-place> and then a <span landing-place id='4' class='inline'></landing-place> </div>",
    "choices": [
      {
        "content": "Pupa",
        "fixed": true,
        "id": "pupa"
      },
      {
        "content": "Egg",
        "id": "egg"
      },
      {
        "content": "Larva",
        "id": "larva"
      },
      {
        "content": "Adult",
        "id": "adult"
      }
    ],
    "config": {
      "shuffle": true
    }
  },
  "weight": 1
};

settings = function(feedback, userResponse, correctResponse) {
  feedback = feedback === undefined ? true : feedback;
  userResponse = userResponse === undefined ? true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};


describe('drag and drop server logic', function() {

  helper.assertNullOrUndefinedAnswersReturnsIncorrect(server);
  
  it('responds incorrect', function() {
    var response = server.createOutcome(_.cloneDeep(component), {
      1: ['larva']
    }, settings(false, true, true));
    response.correctness.should.equal('incorrect');
    response.score.should.equal(0);
  });

  it('respond correct', function() {
    var answer = {
      "1": ["egg", "pupa"],
      "2": [],
      "3": ["larva", "adult"],
      "4": []
    };
    var response = server.createOutcome(_.cloneDeep(component), answer, settings(false, true, true));
    response.correctness.should.equal('correct');
    response.score.should.equal(1);
  });

  it('cardinality is considered', function() {
    var answer = {
      "1": ["egg", "pupa"],
      "2": [],
      "3": ["larva", "adult"],
      "4": []
    };
    var response = server.createOutcome(_.cloneDeep(component), answer, settings(false, true, true));
    response.correctness.should.equal('correct');

    answer = {
      "1": ["pupa", "egg"], // ordered, so incorrect
      "2": [],
      "3": ["larva", "adult"],
      "4": []
    };
    response = server.createOutcome(_.cloneDeep(component), answer, settings(false, true, true));
    response.correctness.should.equal('incorrect');

    answer = {
      "1": ["egg", "pupa"],
      "2": [],
      "3": ["adult", "larva"], // not ordered, so correct
      "4": []
    };
    response = server.createOutcome(_.cloneDeep(component), answer, settings(false, true, true));
    response.correctness.should.equal('correct');
  });



});
