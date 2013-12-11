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
      "apple": "it is correct"
    }
  }
};

describe('feedback-block server logic', function () {

  it('should proxy values from targetOutcome', function() {
    var expected;
    var outcome = server.respond(_.cloneDeep(component), [""], undefined, {correctness: 'correct', studentResponse: "apple"});
    expected = {
      feedback: "it is correct",
      correctness: "correct",
      studentResponse: "apple"
    };
    outcome.should.eql(expected);
  });

});