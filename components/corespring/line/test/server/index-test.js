var 
_ = require('lodash'), 
assert = require('assert'), 
helper = require('../../../../../test-lib/test-helper'),
sinon = require('sinon'),
assert = require('assert'),
should = require('should'),
proxyquire = require('proxyquire').noCallThru(),
fbu = require('../../../server-shared/src/server/feedback-utils'),
serverObj = {
  expressionize: _.identity,
  isFunctionEqual: function(e1, e2, options) {
    return e1 === e2;
  }
},
server = proxyquire('../../src/server', {
  'corespring.function-utils.server': serverObj,
  'corespring.server-shared.server.feedback-utils': fbu
}),
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
},
correctAnswer = {
  A: {
    x: 0,
    y: 7
  },
  B: {
    x: 1,
    y: 9
  }
},
incorrectAnswer = {
  A: {
    x: -1,
    y: -1
  },
  B: {
    x: 1,
    y: 1
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
    var response = server.respond(_.cloneDeep(component), incorrectAnswer, helper.settings(false, true, true));
    response.correctness.should.eql('incorrect');
    response.score.should.eql(0);
    // check if it was called with the right options
    spy.getCall(0).args[2].should.eql({
      variable: 'x',
      sigfigs: 3
    });
  });

  it('respond correct', function() {
    var response = server.respond(_.cloneDeep(component), correctAnswer, helper.settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  describe('feedback', function() {

    function evaluateCorrectAnswerWithFeedback(feedback) {
      var componentWithFeedback = _.cloneDeep(component);
      componentWithFeedback.feedback = feedback;
      return server.respond(componentWithFeedback, correctAnswer, helper.settings(true, true, true));
    }

    it('should be default feedback if feedback obj is null', function() {
      var feedback = null;
      var response = evaluateCorrectAnswerWithFeedback(feedback);
      response.feedback.should.eql('Correct!');
    });

    it('should be custom feedback if feedbackType is "custom"', function() {
      var feedback = {
        correctFeedbackType: 'custom',
        correctFeedback: 'Custom Correct!'
      };
      var response = evaluateCorrectAnswerWithFeedback(feedback);
      response.feedback.should.eql('Custom Correct!');
    });

    it('should be default feedback if feedbackType is not "custom"', function() {
      var feedback = {
        correctFeedbackType: 'anything else but custom',
        correctFeedback: 'Custom Correct!'
      };
      var response = evaluateCorrectAnswerWithFeedback(feedback); 
      response.feedback.should.eql(fbu.keys.DEFAULT_CORRECT_FEEDBACK);
    });

  });

  describe('isScoreable', function(){
    it('should be true for an incomplete model', function(){
      server.isScoreable(null, {}, {}).should.eql(true);
      server.isScoreable({}, {}, {}).should.eql(true);
      server.isScoreable({ model : {}}, {}, {}).should.eql(true);
      server.isScoreable({ model : { config:{}}}, {}, {}).should.eql(true);
    });
    
    it('should be the opposite of exhibitOnly', function(){
      server.isScoreable({ model : { config:{ exhibitOnly: false}}}, {}, {}).should.eql(true);
      server.isScoreable({ model : { config:{ exhibitOnly: true}}}, {}, {}).should.eql(false);
    });
  });

});
