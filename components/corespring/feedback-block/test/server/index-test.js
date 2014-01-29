var assert, component, server, settings, should, _;

//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {'corespring.scoring-utils.server': {}});

assert = require('assert');

should = require('should');

_ = require('lodash');

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
    var outcome = server.respond(_.cloneDeep(component), [""], undefined, {correctness: 'correct', studentResponse: "apple"});
    expected = {
      feedback: "apple correct",
      correctness: "correct"
    };
    outcome.should.eql(expected);
  });

  it('matching correct response', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], undefined, {correctness: 'correct', studentResponse: "apple"});
    expected = {
      feedback: "apple correct",
      correctness: "correct"
    };
    outcome.should.eql(expected);
  });

  it('matching incorrect response', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], undefined, {correctness: 'correct', studentResponse: "bean"});
    expected = {
      feedback: "bean incorrect",
      correctness: "incorrect"
    };
    outcome.should.eql(expected);
  });

  it('catchall correct response', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], undefined, {correctness: 'correct', studentResponse: "bag"});
    expected = {
      feedback: "catchall correct",
      correctness: "correct"
    };
    outcome.should.eql(expected);
  });

  it('catchall incorrect response', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], undefined, {correctness: 'incorrect', studentResponse: "table"});
    expected = {
      feedback: "catchall incorrect",
      correctness: "incorrect"
    };
    outcome.should.eql(expected);
  });

});