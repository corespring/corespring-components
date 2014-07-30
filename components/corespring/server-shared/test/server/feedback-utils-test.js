var assert, server, should;
var _ = require('lodash');
should = require('should');
var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../src/server/feedback-utils');

describe('feedback-utils', function(){
 it('gives no feedback if feedback type is none', function() {
    var config = {};
    config.correctFeedbackType = "none";
    config.incorrectFeedbackType = "none";
    var response = fbu.makeFeedback(config, 'correct');
    should(response).not.be.ok;
  });

 it('gives custom feedback if feedback type is custom', function() {
    var config = {};
    config.correctFeedbackType = 'custom';
    config.correctFeedback = 'custom correct';
    var response = fbu.makeFeedback(config, 'correct');
    should(response).eql('custom correct');
  });

 it('gives default feedback if feedback type is default', function() {
    var config = {};
    config.correctFeedback = 'custom correct';
    var response = fbu.makeFeedback(config, 'correct');
    should(response).eql(fbu.keys.DEFAULT_CORRECT_FEEDBACK);
  });

});
