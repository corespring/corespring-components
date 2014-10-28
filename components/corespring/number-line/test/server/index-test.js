var assert, component, server, settings, should, _;

var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.scoring-utils.server': {}
});

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-focus-task",
  model: {
    config: {
      orientation: "vertical",
      shuffle: true,
      checkIfCorrect: "yes"
    },
    choices: [
      {
        label: "apple",
        value: "apple"
      }, {
        label: "carrot",
        value: "carrot"
      }, {
        label: "turnip",
        value: "turnip"
      }
    ]
  },
  correctResponse: {
    value: ["carrot", "turnip"]
  }
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

describe('box and whiskers server logic', function() {

  it('should handle null answers', function(){
    server.respond({}, null, {}).should.eql({correctness: 'incorrect'});
  });
  it('should handle undefined answers', function(){
    server.respond({}, null, {}).should.eql({correctness: 'incorrect'});
  });
});
