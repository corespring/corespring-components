var assert, component, server, settings, should, _;

//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.scoring-utils.server': {}
});

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-multiple-choice",
  model: {
    prompt: "Which of these is a vegetable?",
    config: {
      orientation: "vertical",
      shuffle: true
    },
    choices: [
      {
        label: "apple",
        value: "apple"
      },
      {
        label: "carrot",
        value: "carrot"
      },
      {
        label: "turnip",
        value: "turnip"
      },
      {
        label: "pear",
        value: "pear"
      }
    ]
  },
  allowPartialScoring: false,
  correctResponse: {
    value: ["carrot", "turnip", "pear"]
  },
  feedback: [
    {
      value: "apple",
      feedback: "Huh?"
    },
    {
      value: "carrot",
      feedback: "Yes",
      notChosenFeedback: "Carrot is a veggie"
    },
    {
      value: "turnip",
      feedback: "Yes",
      notChosenFeedback: "Turnip is a veggie"
    },
    {
      value: "pear",
      feedback: "pear",
      notChosenFeedback: "Pear is a veggie"
    }
  ]
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

describe('multiple-choice server logic', function() {

  describe('is correct', function() {
    server.isCorrect(["1"], ["1"]).should.eql(true);
    server.isCorrect(["1", "2"], ["1"]).should.eql(false);
    server.isCorrect(["1"], ["1", "2"]).should.eql(false);
  });

  describe('respond', function() {
    it('should not show any feedback', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple"], settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.correctness.should.eql(expected.correctness);
      response.score.should.eql(expected.score);
    });


    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["carrot", "turnip","pear"], settings(true, true, true));
      expected = {
        correctness: "correct",
        score: 1,
        feedback: [
          {
            value: "carrot",
            feedback: "Yes",
            correct: true
          },
          {
            value: "turnip",
            feedback: "Yes",
            correct: true
          },
          {
            value: "pear",
            feedback: "pear",
            correct: true
          }
        ]
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });

    it('should respond to an incorrect response (show correct too)', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple"], settings(true, true, true));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: [
          {
            value: "carrot",
            feedback: "Carrot is a veggie",
            correct: true
          },
          {
            value: "turnip",
            feedback: "Turnip is a veggie",
            correct: true
          },
          {
            value: "pear",
            feedback: "Pear is a veggie",
            correct: true
          },
          {
            value: "apple",
            feedback: "Huh?",
            correct: false
          }
        ]
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });


    it('should respond to an incorrect response (do not show correct too)', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple"], settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: [
          {
            value: "apple",
            feedback: "Huh?",
            correct: false
          }
        ]
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });


    it('should respond to an incorrect response and show feedback for 1 incorrect and 1 correct', function() {
      var expected, response;
      response = server.respond(_.cloneDeep(component), ["apple", "carrot"], settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: [
          {
            value: "apple",
            feedback: "Huh?",
            correct: false
          },
          {
            value: "carrot",
            feedback: "Yes",
            correct: true
          }
        ]
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });

    it('should show empty feedback if no feedback is defined', function() {
      var noFeedbackComponent = _.cloneDeep(component);
      delete noFeedbackComponent.feedback;

      var response = server.respond(noFeedbackComponent, ["apple", "carrot"], settings(true, true, false));
      var expected = {
        correctness: "incorrect",
        score: 0,
        feedback: [
          {
            value: "apple",
            correct: false
          },
          {
            value: "carrot",
            correct: true
          }
        ],
        comments: undefined
      };
      response.should.eql(expected);
    });

  });

  describe('Scoring', function() {
    it('if no partial scoring is allowed score should be proportionate to number of correctly chosen answers', function() {
      var response = server.respond(component, ["carrot"], settings(true, true, false));
      response.score.should.eql(0.33);

      response = server.respond(component, ["turnip","pear"], settings(true, true, false));
      response.score.should.eql(0.67);
    });

    it('if no partial scoring is allowed score should be proportionate to number of correctly chosen answers', function() {
      var comp = _.cloneDeep(component);
      comp.allowPartialScoring = true;
      comp.partialScoring = [
        {numberOfCorrect: 1, scorePercentage: 25},
        {numberOfCorrect: 2, scorePercentage: 40}
      ];
      var response = server.respond(comp, ["carrot"], settings(true, true, false));
      response.score.should.eql(0.25);

      response = server.respond(comp, ["turnip", "pear"], settings(true, true, false));
      response.score.should.eql(0.4);
    });
  });
});
