/*jshint expr: true*/
var assert, server, should;
var _ = require('lodash');
should = require('should');
var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../src/server/feedback-utils');

describe('feedback-utils', function() {
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

  describe('defaultCreateOutcome', function() {
    describe('multiple partialScoring', function() {
      it('should return the average score of all sections', function() {
        var question = {
          _uid: '123',
          allowPartialScoring: true,
          partialScoring: {
            sections: [
              {
                numAnswers: 1,
                numAnsweredCorrectly: 1,
                numberOfCorrectResponses: 2,
                partialScoring: [
                  {numberOfCorrect:1, scorePercentage: 30}
                ]
              },
              {
                numAnswers: 1,
                numAnsweredCorrectly: 1,
                numberOfCorrectResponses: 2,
                partialScoring: [
                  {numberOfCorrect:1, scorePercentage: 30}
                ]
              }
            ]
          }
        };
        var answer = {
          _uid: '123'
        };
        var settings = {};
        var numAnswers = 2;
        var numAnsweredCorrectly = 2;
        var totalCorrectAnswers = 4;
        var response = fbu.defaultCreateOutcome(
          question,
          answer,
          settings,
          numAnswers,
          numAnsweredCorrectly,
          totalCorrectAnswers);
        should(response.score).eql((30+30)/2/100);
      });
    });
  });

});