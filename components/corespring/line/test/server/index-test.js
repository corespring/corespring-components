var assert, component, server, settings, should, helper;

var _ = require('lodash');

helper = require('../../../../../test-lib/test-helper');

var proxyquire = require('proxyquire').noCallThru();

var sinon = require('sinon');

var serverObj = {
  expressionize: _.identity,
  isFunctionEqual: function(e1, e2, options) {
    return e1 === e2;
  }
};

var fbu = require('../../../server-shared/src/server/feedback-utils');

server = proxyquire('../../src/server', {
  'corespring.function-utils.server': serverObj,
  'corespring.server-shared.server.feedback-utils': fbu
});

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  "componentType": "corespring-line",
  "correctResponse": "y=2x+7",
  "model": {
    "config": {
      "domain": "10",
      "range": "10",
      "scale": "1",
      "domainLabel": "x",
      "rangeLabel": "y",
      "tickLabelFrequency": "5",
      "sigfigs": "-1"
    }
  }
};

describe('line interaction server logic', function() {


  it('returns incorrect outcome for an empty answer', function(){
      var outcome = server.respond({ feedback: {}, model: {config: {}}}, null, helper.settings(true, true, true));
      outcome.should.eql({
        correctness: 'incorrect',
        score: 0,
        feedback: fbu.keys.DEFAULT_INCORRECT_FEEDBACK 
      });
  });

  it('respond incorrect', function() {
    var spy = sinon.spy(serverObj, 'isFunctionEqual');
    var response = server.respond(_.cloneDeep(component), {
      A: {
        x: -1,
        y: -1
      },
      B: {
        x: 1,
        y: 1
      }
    }, helper.settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
    // check if it was called with the right options
    spy.getCall(0).args[2].should.eql({
      variable: 'x',
      sigfigs: 3
    });
  });

  it('respond correct', function() {
    var response = server.respond(_.cloneDeep(component), {
      A: {
        x: 0,
        y: 7
      },
      B: {
        x: 1,
        y: 9
      }
    }, helper.settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });


});
