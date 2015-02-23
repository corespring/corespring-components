var server;

var fbu = require('../../../server-shared/src/server/feedback-utils');
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});

describe('drag-and-drop-inline-v201', function() {

  var utils = null;

  it('should return incorrect + feedback for an empty answer', function() {
    var outcome = server.respond({
        feedback: {}
      },
      null, {
        showFeedback: true
      });

    outcome.should.eql({
      correctness: 'incorrect',
      score: 0,
      correctResponse: null,
      correctClass: 'warning',
      answer: null,
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
    });
  });


  it('should return incorrect + feedback for an empty answer when using custom feedback', function() {
    var outcome = server.respond({
      feedback: {
        incorrectFeedbackType: 'custom',
        incorrectFeedback: 'custom no'
      }
    }, null, {
      showFeedback: true
    }, {});
    outcome.should.eql({
      correctness: 'incorrect',
      score: 0,
      correctResponse: null,
      correctClass: 'warning',
      answer: null,
      feedback: fbu.keys.DEFAULT_WARNING_FEEDBACK
    });
  });

  it('should return incorrect if it has superfluous correct answers', function() {
    var question = {
      correctResponse: {
        aa_1: ['c_1', 'c_2']
      }
    };
    var answer = {
      aa_1: ['c_1', 'c_2', 'c_1']
    };
    var settings = {};
    var outcome = server.respond(question, answer, settings);
    outcome.should.eql({
      correctness: "incorrect",
      correctResponse: {
        aa_1: ['c_1', 'c_2']
      },
      answer: {
        aa_1: ['c_1', 'c_2', 'c_1']
      },
      score: 0,
      correctClass: "partial",
      comments: null
    });

  });

});