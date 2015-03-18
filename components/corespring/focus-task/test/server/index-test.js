var assert, component, server, settings, should, _;

var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {
  'corespring.scoring-utils.server': {}
});

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
  componentType: "corespring-focus-task",
  model: {
    config: {
      orientation: "vertical",
      shuffle: true,
      checkIfCorrect: "yes"
    },
    choices: [
      {
        label: "apple",
        value: "apple"
      }, {
        label: "carrot",
        value: "carrot"
      }, {
        label: "turnip",
        value: "turnip"
      }
    ]
  },
  correctResponse: {
    value: ["carrot", "turnip"]
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

describe('focus-task server logic', function() {


  it('returns an incorrect outcome for an empty answer', function(){
    var outcome = server.createOutcome({correctResponse: {value: ['a']}}, null, {showFeedback: true, highlightCorrectResponse: true, highlightUserResponse: true});
    outcome.should.eql({
      score: 0,
      correctness: 'incorrect',
      feedback: {
        a: 'shouldHaveBeenSelected'
      }
    });
  });
  
  describe('build feedback', function(){
    it('returns an empty object', function(){
      server.buildFeedback({correctResponse: {value: ['a']}}, {}, {}, true).should.eql({});
    });

    it('returns only the correct response', function(){
      server.buildFeedback({correctResponse: {value: ['a']}}, {}, {highlightCorrectResponse: true}, true).should.eql({
        a: 'shouldHaveBeenSelected'
      });
    });

    it('returns correct and user response', function(){
      server.buildFeedback({correctResponse: {value: ['a']}}, ['b', 'c'], {highlightCorrectResponse: true, highlightUserResponse: true}, true).should.eql({
        a: 'shouldHaveBeenSelected',
        b: 'shouldNotHaveBeenSelected',
        c: 'shouldNotHaveBeenSelected'
      });
    });

    it('returns user response', function(){
      server.buildFeedback({correctResponse: {value: ['a']}}, ['b', 'c'], {highlightCorrectResponse: false, highlightUserResponse: true}, true).should.eql({
        b: 'shouldNotHaveBeenSelected',
        c: 'shouldNotHaveBeenSelected'
      });
    });

  });
  
  describe('is correct', function() {
    server.isCorrect(["1"], ["1"]).should.eql(true);
    server.isCorrect(["1", "2"], ["1"]).should.eql(false);
    server.isCorrect(["1"], ["1", "2"]).should.eql(false);
  });

  describe('createOutcome', function() {
    it('should not show any feedback', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple"], settings(false, true, true));
      expected = {
        correctness: "incorrect",
        score: 0
      };
      response.correctness.should.eql(expected.correctness);
      response.score.should.eql(expected.score);
    });


    it('should respond to a correct answer', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["carrot", "turnip"], settings(true, true, true));
      expected = {
        correctness: "correct",
        score: 1,
        feedback: {
          carrot: 'shouldHaveBeenSelected',
          turnip: 'shouldHaveBeenSelected'
        }
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });

    it('should respond to an incorrect response (show correct too)', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple"], settings(true, true, true));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          apple: "shouldNotHaveBeenSelected",
          carrot: 'shouldHaveBeenSelected',
          turnip: 'shouldHaveBeenSelected'
        }
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });


    it('should respond to an incorrect response (do not show correct too)', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple"], settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          apple: "shouldNotHaveBeenSelected"
        }
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });



    it('should respond to an incorrect response and show feedback for 1 incorrect and 1 correct', function() {
      var expected, response;
      response = server.createOutcome(_.cloneDeep(component), ["apple", "carrot"], settings(true, true, false));
      expected = {
        correctness: "incorrect",
        score: 0,
        feedback: {
          apple: "shouldNotHaveBeenSelected",
          carrot: 'shouldHaveBeenSelected'
        }
      };
      response.correctness.should.eql(expected.correctness);
      response.feedback.should.eql(expected.feedback);
      response.score.should.eql(expected.score);
    });

  });
});
