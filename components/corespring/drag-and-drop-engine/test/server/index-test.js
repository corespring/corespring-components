var server;

var shared = require('../../../server-shared/src/server');
var fbu = require('../../../server-shared/src/server/feedback-utils');
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.server-shared.server' : shared,
  'corespring.server-shared.feedback-utils' : fbu
});

describe('drag-and-drop-engine', function() {

  var utils = null;

  it('should return incorrect + feedback for an empty answer', function() {
    var outcome = server.createResponse(
      {feedback: {}}, 
      null, 
      {showFeedback: true});

    outcome.should.eql(
      {
        correctness: 'incorrect', 
        score: 0, 
        correctResponse: null, 
        answer: null, 
        feedback: fbu.keys.DEFAULT_INCORRECT_FEEDBACK});
  });


  it('should return incorrect + feedback for an empty answer when using custom feedback', function() {
    var outcome = server.createResponse(

      {
        feedback: {
          incorrectFeedbackType: 'custom',
          incorrectFeedback: 'custom no'
        }
      }, null, {showFeedback: true}, {});
    outcome.should.eql({correctness: 'incorrect', score: 0, correctResponse: null, answer: null, feedback: 'custom no'});
  });

});
