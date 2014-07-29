var component, server, settings;

var _ = require('lodash');
var sinon = require('sinon');
var assert = require('assert');
var should = require('should');
var proxyquire = require('proxyquire').noCallThru();

var serverObj = {
  expressionize: _.identity,
  isFunctionEqual: function(e1, e2, options) {
    return e1 === e2;
  }
};

server = proxyquire('../../src/server', {
  'corespring.function-utils.server': serverObj
});


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

describe('line interaction server logic', function() {

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
    }, settings(false, true, true));
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
    }, settings(false, true, true));
    response.correctness.should.eql('correct');
    response.score.should.eql(1);
  });

  describe('feedback', function() {

    function prepareComponent(component, feedback){
      var result = _.cloneDeep(component);
      result.feedback = feedback;
      return result;
    }

    it('should be default feedback if feedback obj is null', function() {
      var feedbackObj = null;
      var response = server.respond(prepareComponent(component, feedbackObj), {
        A: {
          x: 0,
          y: 7
        },
        B: {
          x: 1,
          y: 9
        }
      }, settings(true, true, true));
      response.feedback.should.eql('Correct!');
    });

    it('should be custom feedback if feedbackType is "custom"', function() {
      var feedbackObj = {correctFeedbackType:'custom', correctFeedback: 'Custom Correct!'};
      var response = server.respond(prepareComponent(component,feedbackObj), {
        A: {
          x: 0,
          y: 7
        },
        B: {
          x: 1,
          y: 9
        }
      }, settings(true, true, true));
      response.feedback.should.eql('Custom Correct!');
    });

    it('should be default feedback if feedbackType is not "custom"', function() {
      var feedbackObj = {correctFeedbackType:'anything else but custom', correctFeedback: 'Custom Correct!'};
      var response = server.respond(prepareComponent(component,feedbackObj), {
        A: {
          x: 0,
          y: 7
        },
        B: {
          x: 1,
          y: 9
        }
      }, settings(true, true, true));
      response.feedback.should.eql('Correct!');
    });

  });



});
