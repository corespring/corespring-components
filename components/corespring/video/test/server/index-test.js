var assert, server, settings, should, _;

server = require('../../src/server');
assert = require('assert');
should = require('should');

_ = require('lodash');

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

describe('video server logic', function() {
  var expected, response;
  var component = {
    componentType: "corespring-video",
    model: {
      config: {
      }
    }
  };

  it('should respond score 1', function() {
    response = server.respond(_.cloneDeep(component), "", settings(false, true, true));
    expected = {
      score: 1
    };
    response.score.should.eql(expected.score);
  });


});
