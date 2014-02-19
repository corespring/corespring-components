var assert, component, server, settings, should, _;

//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {});

assert = require('assert');

should = require('should');

_ = require('lodash');


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

component = {
  componentType: "corespring-feedback-block",
  feedback: {
    correct: {
      "apple": "apple correct",
      "potato": "potato correct",
      "*": "catchall correct"
    },
    incorrect: {
      "bean": "bean incorrect",
      "lentil": "lentil incorrect",
      "*": "catchall incorrect"
    }
  }
};

describe('feedback-block server logic', function () {

  it('should proxy values from targetOutcome', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], settings(), {correctness: 'correct', studentResponse: "apple"});
    expected = {
      feedback: "apple correct",
      correctness: "correct"
    };
    outcome.should.eql(expected);
  });

  it('matching correct response', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], settings(), {correctness: 'correct', studentResponse: "apple"});
    expected = {
      feedback: "apple correct",
      correctness: "correct"
    };
    outcome.should.eql(expected);
  });

  it('matching incorrect response', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], settings(), {correctness: 'correct', studentResponse: "bean"});
    expected = {
      feedback: "bean incorrect",
      correctness: "incorrect"
    };
    outcome.should.eql(expected);
  });

  it('catchall correct response', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], settings(), {correctness: 'correct', studentResponse: "bag"});
    expected = {
      feedback: "catchall correct",
      correctness: "correct"
    };
    outcome.should.eql(expected);
  });

  it('catchall incorrect response', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], settings(), {correctness: 'incorrect', studentResponse: "table"});
    expected = {
      feedback: "catchall incorrect",
      correctness: "incorrect"
    };
    outcome.should.eql(expected);
  });

});