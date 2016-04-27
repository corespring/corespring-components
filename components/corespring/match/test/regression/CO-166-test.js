/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('match', function() {

  "use strict";

  var componentName = 'match';
  var itemJsonFilename = 'CO-166.json';

  function answerInput(questionId){
    return '.question-row[question-id="' + questionId + '"] .corespring-match-choice.input';
  }

  function answerEvaluated(questionId, correctness){
    return '.question-row[question-id="' + questionId + '"] .' + correctness;
  }

  function correctAnswer(questionId){
    return '.see-answer-panel .panel-body .question-row[question-id="' + questionId + '"] .correct';
  }

  function solutionPanelHeader(){
    return '.see-answer-panel .panel .panel-heading';
  }

  beforeEach(function(done) {
    browser.options.extendBrowser(browser);

    browser.isExistingWithWait = function(selector,callback){
      return this.waitForExist(selector).isExisting(selector,callback);
    };

    browser
      .loadTest(componentName, itemJsonFilename)
      .call(done);
  });

  it('does evaluate answers correctly', function(done) {
    browser
      .waitAndClick(answerInput('Row1'))
      .waitAndClick(answerInput('Row2'))
      .waitAndClick(answerInput('Row3'))
      .submitItem()
      .isExistingWithWait(answerEvaluated('Row1', 'correct'), function(err,res){
        [err,res].should.eql([undefined,true], "Row1");
      })
      .isExistingWithWait(answerEvaluated('Row2', 'incorrect'), function(err,res){
        [err,res].should.eql([undefined,true], "Row2");
      })
      .isExistingWithWait(answerEvaluated('Row3', 'correct'), function(err,res){
        [err,res].should.eql([undefined,true], "Row3");
      })
      .call(done);
  });

  it('does show solution correctly', function(done) {
    browser
      .waitAndClick(answerInput('Row1'))
      .submitItem()
      .waitFor(solutionPanelHeader())
      .waitAndClick(solutionPanelHeader())
      .isExistingWithWait(correctAnswer('Row1'), function(err,res){
        [err,res].should.eql([undefined,true], "Row1");
      })
      .isExistingWithWait(correctAnswer('Row2'), function(err,res){
        [err,res].should.eql([undefined,true], "Row2");
      })
      .isExistingWithWait(correctAnswer('Row3'), function(err,res){
        [err,res].should.eql([undefined,true], "Row3");
      })
      .call(done);
  });

});