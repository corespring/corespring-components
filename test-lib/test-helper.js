var assert, should;

assert = require('assert');
should = require('should');

exports.settings = function(feedback, userResponse, correctResponse) {
  feedback = feedback === undefined ? true : feedback;
  userResponse = userResponse === undefined ? true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};

exports.assertNullOrUndefinedAnswersReturnsIncorrect = function(s, functionName, feedback){
  functionName = functionName || 'respond';

  it('should return incorrect if the answer is null or undefined', function(){
    var outcome = s[functionName]({}, null, {
      showFeedback: true,
      highlightUserResponse: true,
      highlightCorrectResponse: true
    });
    outcome.correctness.should.be.ok;
    outcome.correctness.should.eql('incorrect');
    outcome.score.should.be.eql(0);

    if(feedback){
      outcome.feedback.should.be.ok;
      outcome.feedback.should.eql(feedback);
    }
  });
};