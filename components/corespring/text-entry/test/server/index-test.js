var assert, component, server, settings, should, _;

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-inline-choice",
  model: {
    prompt: "Which of these is a vegetable?",
    config: {
      shuffle: true
    },
    choices: [
      {
        label: "apple",
        value: "apple"
      }, {
        label: "carrot",
        value: "carrot"
      }, {
        label: "banana",
        value: "banana"
      }
    ]
  },
  correctResponse: "carrot",
  feedback: {
    "apple": {
      feedback: "Huh?"
    },
    "carrot": {
      feedback: "Yes"
    },
    "banana": {
      feedback: "Nopes"
    }
  }
};

settings = function(feedback, userResponse, correctResponse) {
  feedback = feedback === undefined ? true : feedback;
  userResponse = userResponse === undefined ?  true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};

describe('text entry server logic', function() {
});
