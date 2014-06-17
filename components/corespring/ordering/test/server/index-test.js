var assert, component, server, settings, should, _;

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  "componentType": "corespring-ordering",
  "title": "Butterfly Ordering",
  "correctResponse": ["egg", "pupa", "larva", "adult"],
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
      "shuffle": true
    },
    "prompt": "Drag the stages of the butterfly's lifecycle into order",
    "correctResponse": ["2", "1", "4", "3"]
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

describe('ordering server logic', function() {

  describe('respond incorrect', function() {
    var response = server.respond(_.cloneDeep(component), ["1", "2", "3", "4"], settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
  });

  describe('respond correct', function() {
    var response = server.respond(_.cloneDeep(component), ["2", "1", "4", "3"], settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

});
