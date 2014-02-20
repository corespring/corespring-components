var assert, component, server, settings, should, _;

server = require('../../src/server');

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
    },
    "prompt": "Drag the 2nd stage of the butterfly's lifecycle on to the the pod"
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

  describe('respond incorrect', function() {
    var response = server.respond(_.cloneDeep(component), {
      1: ['larva']
    }, settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
  });

  describe('respond correct', function() {
    var answer = {
      "1": ["egg", "pupa"],
      "2": [],
      "3": ["larva", "adult"],
      "4": []
    };
    var response = server.respond(_.cloneDeep(component), answer, settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  describe('cardinality is considered', function() {
    var answer = {
      "1": ["egg", "pupa"],
      "2": [],
      "3": ["larva", "adult"],
      "4": []
    };
    var response = server.respond(_.cloneDeep(component), answer, settings(false, true, true));
    response.correctness.should.eql('correct');

    answer = {
      "1": ["pupa", "egg"], // ordered, so incorrect
      "2": [],
      "3": ["larva", "adult"],
      "4": []
    };
    response = server.respond(_.cloneDeep(component), answer, settings(false, true, true));
    response.correctness.should.eql('incorrect');

    answer = {
      "1": ["egg", "pupa"],
      "2": [],
      "3": ["adult", "larva"], // not ordered, so correct
      "4": []
    };
    response = server.respond(_.cloneDeep(component), answer, settings(false, true, true));
    response.correctness.should.eql('correct');
  });

});
