var server;
server = require('../../src/server');

describe('corespring', function() {

  var utils = null;

  it('should return incorrect + feedback for an empty answer', function() {
    var outcome = server.createResponse({feedback: {}}, null, {showFeedback: true}, { incorrect: 'no'});
    outcome.should.eql({correctness: 'incorrect', score: 0, correctResponse: null, answer: null, feedback: 'no'});
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
