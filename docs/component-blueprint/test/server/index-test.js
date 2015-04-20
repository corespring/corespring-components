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
  "componentType": "corespring-dnd-categorize",
  "title": "Drag and Drop Categorize",
  "correctResponse": {
    "cat_1": ["choice_1"],
    "cat_2": ["choice_2", "choice_3"]
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
    "categories": [
      {
        "id": "cat_1",
        "label": "Category 1"
      },
      {
        "id": "cat_2",
        "label": "Category 2"
      }
    ],
    "choices": [
      {
        "id": "choice_1",
        "label": "a",
        "moveOnDrag": false
      },
      {
        "id": "choice_2",
        "label": "b",
        "moveOnDrag": false
      },
      {
        "id": "choice_3",
        "label": "c",
        "moveOnDrag": false
      },
      {
        "id": "choice_4",
        "label": "d",
        "moveOnDrag": false
      }
    ],
    "config": {
      "shuffle": false,
      "answerAreaPosition": "below",
      "maxCategoriesPerRow": 2
    }
  },
  "weight": 1
}

beforeEach(function() {
  component = _.cloneDeep(componentTemplate);
  correctResponse = _.cloneDeep(componentTemplate.correctResponse);
});

describe('categorize server logic', function() {

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
        cat1: ['choice_2']
      }
      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(false, true, true));
      expect(response.correctness).to.eql("incorrect");
      expect(response.score).to.eql(0);
      expect(response.feedback).to.be.undefined;
    });

    it('should respond to a correct answer', function() {
      var answers = _.cloneDeep(correctResponse);
      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));
      var expected = {
        correctness: "correct",
        correctClass: "correct",
        score: 1,
        feedback: "Correct!",
        detailedFeedback: {
          cat_1: {
            feedback: ['correct']
          },
          cat_2: {
            feedback: ['correct', 'correct']
          }
        }
      };

      expect(response).to.eql(expected);
    });

    it('should respond to incorrect result and user did not choose anything', function() {
      var answers = {
        cat_1: [],
        cat_2: []
      };

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "warning",
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
      };
      expect(response).to.eql(expected);
    });


    it('should respond to incorrect result and user chose incorrectly', function() {
      var answers = {
        cat_1: ['choice_3'],
        cat_2: ['choice_1']
      };

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "incorrect",
        score: 0,
        correctResponse: correctResponse,
        feedback: componentTemplate.feedback.incorrectFeedback,
        detailedFeedback: {
          cat_1: {
            feedback: ['incorrect']
          },
          cat_2: {
            answerExpected: true,
            feedback: ['incorrect']
          }
        }
      };
      expect(response).to.eql(expected);
    });


    it('should respond to partially correct result (feedback + user + correct)', function() {
      var answers = {
        cat_1: ['choice_1'],
        cat_2: ['choice_2']
      };

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "partial",
        score: 0.2,
        correctResponse: correctResponse,
        feedback: 'Almost!',
        detailedFeedback: {
          cat_1: {
            feedback: ['correct']
          },
          cat_2: {
            answerExpected: true,
            feedback: ['correct']
          }
        }
      };
      expect(response).to.eql(expected);
    });

    it('should respond with partial result when superfluous answers exist', function() {
      var answers = {
        cat_1: ['choice_1', 'choice_1'],
        cat_2: ['choice_2', 'choice_3']
      };

      var response = server.createOutcome(_.cloneDeep(component), answers, helper.settings(true, true, true));

      var expected = {
        correctness: "incorrect",
        correctClass: "partial",
        score: 0.4,
        correctResponse: correctResponse,
        feedback: "Almost!",
        detailedFeedback: {
          cat_1: {
            feedback: ['correct', 'incorrect']
          },
          cat_2: {
            feedback: ['correct', 'correct']
          }
        }
      };
      expect(response).to.eql(expected);
    });

  });


});