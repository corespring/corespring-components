var component, correctResponse, settings;

var helper = require('../../../../../test-lib/test-helper');

//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');
var _ = require('lodash');

var server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu,
  'corespring.scoring-utils.server': {},
  '_': _
});

var expect = require('chai').expect;



var componentTemplate = {
  "componentType": "corespring-blueprint",
  "correctResponse": {
    //TODO fill in data for correct response
  },
  allowPartialScoring: true,
  "partialScoring": [
    {
      "numberOfCorrect": 1,
      "scorePercentage": 10
    },
    {
      "numberOfCorrect": 2,
      "scorePercentage": 20
    },
    {
      "numberOfCorrect": 3,
      "scorePercentage": 30
    },
    {
      "numberOfCorrect": 4,
      "scorePercentage": 40
    }
  ],
  feedback: {
    "correctFeedbackType": "default",
    "partialFeedbackType": "default",
    "incorrectFeedbackType": "custom",
    "incorrectFeedback": "Everything is wrong !"
  },
  "model": {
    //TODO fill in data for model
    "config": {
      //TODO fill in data for rendering config
    }
  },
  "weight": 1
}

beforeEach(function() {
  component = _.cloneDeep(componentTemplate);
  correctResponse = _.cloneDeep(componentTemplate.correctResponse);
});

describe('blueprint server logic', function() {

  it('should return warning if the answer is null', function() {
    var outcome = server.createOutcome(component, null, helper.settings(true, true, true));
    outcome.should.eql({
      correctness: 'incorrect',
      correctClass: 'warning',
      score: 0,
      feedback: fbu.defaults.warning,
      detailedFeedback: {
        cat_1: {
          answerExpected: true
        },
        cat_2: {
          answerExpected: true
        }
      }
    });
  });

  it('should return warning if the answer is undefined', function() {
    var outcome = server.createOutcome(component, undefined, helper.settings(true, true, true));
    outcome.should.eql({
      correctness: 'incorrect',
      correctClass: 'warning',
      score: 0,
      feedback: fbu.defaults.warning,
      detailedFeedback: {
        cat_1: {
          answerExpected: true
        },
        cat_2: {
          answerExpected: true
        }
      }
    });

  });

  describe('createOutcome', function() {

    it('should not show any feedback when no feedback is allowed', function() {
      var answers = {

      }
      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(false, true, true));
      expect(response.feedback).to.be.undefined;
    });

    it('should respond to a correct answer', function() {
      var answers = _.cloneDeep(correctResponse);
      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));
      var expected = {
        correctness: "correct",
        correctClass: "correct",
        score: 1,
        feedback: "Correct!"
      };

      expect(response).to.eql(expected);
    });

    it('should respond to incorrect result and user did not choose anything', function() {
      var answers = {
        //TODO set up incorrrect answer
      };

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "warning",
        score: 0,
        feedback: fbu.defaults.warning
      };
      expect(response).to.eql(expected);
    });


    it('should respond to incorrect result and user chose incorrectly', function() {
      var answers = {
        //TODO setup incorrect answer
      };

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "incorrect",
        score: 0,
        correctResponse: correctResponse,
        feedback: componentTemplate.feedback.incorrectFeedback
      };
      expect(response).to.eql(expected);
    });


    it('should respond to partially correct result', function() {
      var answers = {
        //TODO set up partially correct answer
      };

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "partial",
        score: 0.2,
        correctResponse: correctResponse,
        feedback: 'Almost!'
      };
      expect(response).to.eql(expected);
    });

  });


});