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
    "3": ["larva"],
    "4": ["adult"]
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
    "answerArea": "<div>A butterfly is first a <landingPlace id='1' class='inline'></landingPlace> then a <landingPlace id='2' class='inline'></landingPlace> and then a <landingPlace id='3' class='inline'></landingPlace> and then a <landingPlace id='4' class='inline'></landingPlace> </div>",
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

settings = function (feedback, userResponse, correctResponse) {
  feedback = feedback === undefined ? true : feedback;
  userResponse = userResponse === undefined ? true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};

describe('drag and drop server logic', function () {

  describe('respond incorrect', function () {
    var response = server.respond(_.cloneDeep(component), {1: ['larva']}, settings(false, true, true));
    response.should.eql(
      {
        correctResponse: {
          '1': [ 'egg', 'pupa' ],
          '2': [],
          '3': [ 'larva' ],
          '4': [ 'adult' ]
        },
        correctness: 'incorrect',
        answer: { '1': ['larva'] },
        score: 0
      });
  });

  describe('respond correct', function () {
    var answer = {
      "1": ["egg", "pupa"],
      "2": [],
      "3": ["larva"],
      "4": ["adult"]
    };
    var response = server.respond(_.cloneDeep(component), answer, settings(false, true, true));
    response.should.eql(
      {
        correctResponse: {
          '1': [ 'egg', 'pupa' ],
          '2': [],
          '3': [ 'larva' ],
          '4': [ 'adult' ]
        },
        correctness: 'correct',
        answer: answer,
        score: 1
      }
    );
  });

});
