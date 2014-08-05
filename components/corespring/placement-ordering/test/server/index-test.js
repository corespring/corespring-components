var fbu, assert, component, server, settings, should, _, helper, shared, helper, proxyquire;

proxyquire = require('proxyquire').noCallThru();
helper = require('../../../../../test-lib/test-helper');

fbu = require('../../../server-shared/src/server/feedback-utils');

server = proxyquire('../../src/server', {
  'corespring.drag-and-drop-engine.server': {},
  'corespring.server-shared.server.feedback-utils': fbu
});

assert = require('assert');

should = require('should');

_ = require('lodash');


describe('placement ordering', function() {

  it('should return an incorrect outcome for an empty answer', function() {

    var outcome = server.respond({
      feedback: {}
    }, null, helper.settings(true, true, true));
    
    outcome.should.eql({
        correctness: "incorrect",
        correctResponse: undefined,
        answer: null,
        score: 0,
        correctClass: "incorrect",
        feedback: "Good try but that is not the correct answer."
      });
  });
});