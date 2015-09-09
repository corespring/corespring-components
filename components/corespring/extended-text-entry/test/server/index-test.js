var assert, component, server, settings, should, _;

server = require('../../src/server');

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  "componentType": "corespring-extended-text-entry",
  "title": "Extended Text Entry",
  "feedback": {
    "feedbackType": "default"
  },
  "model": {
    "config": {
      "expectedLength": "100",
      "expectedLines": "5"
    }
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

describe('extended text entry server logic', function() {


  it('should return an incorrect response for a null answer', function(){
    var outcome = server.createOutcome({}, null, settings(true));
    outcome.should.eql({correctness: 'incorrect', score: 0, feedback: server.feedback.NO_ANSWER});
  });

  it('should show default feedback', function() {
    var response = server.createOutcome(_.cloneDeep(component), "Some text", settings(true, true, false));
    response.feedback.should.eql("Your answer was submitted.");
  });

  it('should show custom feedback', function() {
    var customComponent = _.cloneDeep(component);
    customComponent.feedback.feedbackType = 'custom';
    customComponent.feedback.feedback = 'custom feedback';

    var response = server.createOutcome(customComponent, "Some text", settings(true, true, false));
    response.feedback.should.eql("custom feedback");
  });

  it('should show empty response feedback', function() {
    var customComponent = _.cloneDeep(component);
    var response = server.createOutcome(customComponent, "", settings(true, true, false));
    response.correctness.should.eql("incorrect");
  });

  it('should show no feedback', function() {
    var customComponent = _.cloneDeep(component);
    customComponent.feedback.feedbackType = 'none';
    customComponent.feedback.feedback = 'custom feedback';

    var response = server.createOutcome(customComponent, "Some text", settings(true, true, false));
    response.should.eql({feedback: undefined, comments: undefined});
  });

});
