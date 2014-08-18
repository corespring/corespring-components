var assert, component, server, settings, should, _;

//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {});

assert = require('assert');

should = require('should');

_ = require('lodash');


settings = function(feedback, userResponse, correctResponse) {
  feedback = feedback === undefined ? true : feedback;
  userResponse = userResponse === undefined ? true : userResponse;
  correctResponse = correctResponse === undefined ? true : correctResponse;

  return {
    highlightUserResponse: userResponse,
    highlightCorrectResponse: correctResponse,
    showFeedback: feedback
  };
};


component = {
  componentType: 'corespring-feedback-block',
  feedback: {
    correct: [{
      input: 'apple',
      feedback: 'apple correct'
    }, {
      input: 'potato',
      feedback: 'potato correct'
    }, {
      input: '*',
      feedback: 'catchall correct'
    }],
    incorrect: [{
      input: 'bean',
      feedback: 'bean incorrect'
    }, {
      input: 'lentil',
      feedback: 'lentil incorrect'
    }, {
      input: '*',
      feedback: 'catchall incorrect'
    }]
  }
};

describe('find-feedback', function(){

  it('should find a string', function(){
    var out = server.findFeedback([{input: 'a', feedback: 'a-fb'}], 'a');
    out.should.eql('a-fb');
  });

  it('should find a string in an array', function(){
    var out = server.findFeedback([{input: 'a', feedback: 'a-fb'}], ['a', 'b']);

    console.log('-------- > ', out);
    out.should.eql('a-fb');
  });
  
  it('should find a string in an array', function(){
    var out = server.findFeedback([{input: 'b', feedback: 'b-fb'}], ['a', 'b']);
    out.should.eql('b-fb');
  });

  //TODO: How do we accomodate multiple feedbacks for an array of student responses
  /*it('failing test - should find a 2 feedbacks in an array', function(){
    var out = server.findFeedback([{input: 'a', feedback: 'a-fb'},{input: 'b', feedback: 'b-fb'}], ['a', 'b']);
    out.should.eql(['a-fb', 'b-fb']);
  });*/
  
});

 describe('feedback-block server logic', function() {

  it('should handle an empty studentResponse', function(){
    var outcome = server.createOutcome(_.cloneDeep(component), [''], settings(), {}); 
    var expected = {
      correctness: 'incorrect',
      feedback: {}
    };
    outcome.should.eql(expected);
  });

  it('should proxy values from targetOutcome', function() {
    var expected;
    var outcome = server.createOutcome(_.cloneDeep(component), [''], settings(), {
      correctness: 'correct',
      studentResponse: 'apple'
    });
    expected = {
      feedback: 'apple correct',
      correctness: 'correct'
    };
    outcome.should.eql(expected);
  });

  it('matching correct response', function() {
    var expected;
    var outcome = server.createOutcome(_.cloneDeep(component), [''], settings(), {
      correctness: 'correct',
      studentResponse: 'apple'
    });
    expected = {
      feedback: 'apple correct',
      correctness: 'correct'
    };
    outcome.should.eql(expected);
  });

  it('matching incorrect response', function() {
    var expected;
    var outcome = server.createOutcome(_.cloneDeep(component), [''], settings(), {
      correctness: 'correct',
      studentResponse: 'bean'
    });
    expected = {
      feedback: 'bean incorrect',
      correctness: 'incorrect'
    };
    outcome.should.eql(expected);
  });

  it('catchall correct response', function() {
    var expected;
    var outcome = server.createOutcome(_.cloneDeep(component), [''], settings(), {
      correctness: 'correct',
      studentResponse: 'bag'
    });
    expected = {
      feedback: 'catchall correct',
      correctness: 'correct'
    };
    outcome.should.eql(expected);
  });

  it('catchall incorrect response', function() {
    var expected;
    var outcome = server.createOutcome(_.cloneDeep(component), [''], settings(), {
      correctness: 'incorrect',
      studentResponse: 'table'
    });
    expected = {
      feedback: 'catchall incorrect',
      correctness: 'incorrect'
    };
    outcome.should.eql(expected);
  });

  it('CA-1779 Feedback is displaying as correct when an incorrect response is input', function() {

    component = {
      componentType: 'corespring-feedback-block',
      weight: 0,
      feedback: {
        correct: [
          {
            input: '5,5',
            feedback: 'Correct!'
          },
          {
            input: '5',
            feedback: 'Correct!'
          }
        ],
        incorrect: [
          {
            input: '*',
            feedback: 'Good try, but 5 is the correct answer.'
          }
        ]
      }
    };

    var targetOutcome = {
      correctness: 'incorrect',
      score: 0,
      feedback: {
        correctness: 'incorrect'
      },
      studentResponse: '5f'
    };

    var expected;
    outcome = server.createOutcome(component, ['the answer is not used in feedback-block'], settings(), targetOutcome);
    expected = {
      correctness: 'incorrect',
      feedback: component.feedback.incorrect[0].feedback
    };
    outcome.should.eql(expected);

    var newSettings = {
      'maxNoOfAttempts': 1,
      'highlightUserResponse': true,
      'highlightCorrectResponse': true,
      'showFeedback': true
    };

    targetOutcome.studentResponse = '5';
    var outcome = server.createOutcome(component, ['the answer is not used in feedback-block'], newSettings, targetOutcome);
    expected = {
      correctness: 'correct',
      feedback: component.feedback.correct[1].feedback
    };
    outcome.should.eql(expected);

  });

});
