var assert, component, server, settings, should, _;

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  "componentType": "corespring-ordering",
  "title": "Butterfly Ordering",
  "correctResponse": ["egg", "pupa","larva","adult"],
  "model": {
    "choices": [
      {
        "label": "Pupa",
        "value": "pupa"
      },
      {
        "label": "Egg",
        "value": "egg"
      },
      {
        "label": "Larva",
        "value": "larva"
      },
      {
        "label": "Adult",
        "value": "adult"
      }
    ],
    "config": {
      "shuffle": true
    },
    "prompt": "Drag the stages of the butterfly's lifecycle into order"
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

describe('ordering server logic', function () {

  describe('respond incorrect', function () {
    var response = server.respond(_.cloneDeep(component), ['larva','egg','pupa','adult'], settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
  });

  describe('respond correct', function () {
    var response = server.respond(_.cloneDeep(component), ["egg", "pupa","larva","adult"], settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

});
