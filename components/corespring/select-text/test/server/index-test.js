var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');
var server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});
var should = require('should');
var _ = require('lodash');
var helper = require('../../../../../test-lib/test-helper');

var component = {
  "componentType": "corespring-select-text",
  "correctResponse": {
    "value": [0, 2, 4]
  },
  "model": {
    "config": {
      "availability": "all",
      "selectionUnit": "word",
      "maxSelections": 0
    },
    "choices": []
  }
};

describe('select text server logic', function() {

  describe('when answer is empty', function() {
    var comp;
    var expected;

    beforeEach(function() {
      comp = _.cloneDeep(component);
      expected = {
        correctness: "incorrect",
        correctClass: "warning",
        warningClass: "answer-expected",
        score: 0,
        feedback: {
          emptyAnswer: true,
          message: "You did not enter a response."
        }
      };
    });

    it('should return an incorrect outcome if answer is null', function() {
      var outcome = server.createOutcome(comp, null, helper.settings(true, true, true));
      outcome.should.eql(expected);
    });

    it('should return an incorrect outcome if answer is empty array', function() {
      var outcome = server.createOutcome(comp, [], helper.settings(true, true, true));
      outcome.should.eql(expected);
    });

  });

  describe('when answer is correct', function() {
    var response;

    beforeEach(function(){
      response = server.createOutcome(_.cloneDeep(component), [0, 2, 4], helper.settings(true, true, true));
    });

    it('should respond with correct', function() {
      response.correctness.should.eql('correct');
    });

    it('should return a score of 1', function() {
      response.score.should.eql(1);
    });

  });

  describe('when answer is incorrect',function(){
    var response;

    beforeEach(function(){
      response = server.createOutcome(_.cloneDeep(component), [1], helper.settings(true, true, true));
    });

    it('should respond with incorrect ', function() {
      response.correctness.should.eql('incorrect');
    });

    it('should respond with score 0 ', function() {
      response.score.should.eql(0);
    });
  });

  describe('when some answers are correct',function(){
    var response;

    beforeEach(function(){
      response = server.createOutcome(_.cloneDeep(component), [0], helper.settings(true, true, true));
    });

    it('should respond with partial', function() {
      response.correctness.should.eql('partial');
    });

    it('should respond with score 0', function() {
      response.score.should.eql(0);
    });

    it('should calculate partial score when allowPartialScoring is true', function() {
      var comp = _.cloneDeep(component);
      comp.allowPartialScoring = true;
      comp.partialScoring = [{
        numberOfCorrect: 1,
        scorePercentage: 30
      }];

      var response = server.createOutcome(comp, [0], helper.settings(false, true, true));
      response.correctness.should.eql('partial');
      response.score.should.eql(0.3);
    });

  });

  it('should have incorrect selections in the feedback', function() {
    var response = server.createOutcome(_.cloneDeep(component), [1, 3], helper.settings(true, true, true));
    response.feedback.choices[0].should.eql({
      index: 1,
      correct: false
    });
    response.feedback.choices[1].should.eql({
      index: 3,
      correct: false
    });
  });

  it('should have correct selections in the feedback', function() {
    var response = server.createOutcome(_.cloneDeep(component), [1, 2, 3], helper.settings(true, true, true));

    response.feedback.choices[0].should.eql({
      index: 1,
      correct: false
    });
    response.feedback.choices[1].should.eql({
      index: 2,
      correct: true
    });
    response.feedback.choices[2].should.eql({
      index: 3,
      correct: false
    });
  });

  it('should have correct response in the feedback', function() {
    var response = server.createOutcome(_.cloneDeep(component), [1, 2], helper.settings(true, true, true));
    response.correctResponse.should.eql([0, 2, 4]);
  });

  it('should not have correct response in the feedback, if show feedback is false', function() {
    var response = server.createOutcome(_.cloneDeep(component), [1, 2], helper.settings(false, true, true));
    response.should.not.have.property('correctResponse');
  });

  it('should not have feedback is show feedback is false', function() {
    var response = server.createOutcome(_.cloneDeep(component), ['1', '2'], helper.settings(false, true, true));
    response.should.not.have.property('feedback');
  });

});