/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe.only('match', function() {

  "use strict";

  var itemJsonFilename = 'CO-166.json';
  var itemJson = RegressionHelper.getItemJson('match', itemJsonFilename);

  function answerInput(questionId){
    return '.question-row[question-id="' + questionId + '"] .choice-input';
  }

  function answerEvaluated(questionId, correctness){
    return '.question-row[question-id="' + questionId + '"] .' + correctness;
  }

  function correctAnswer(questionId){
    return '.see-answer-panel .panel-body .question-row[question-id="' + questionId + '"] .correct';
  }

  beforeEach(function(done) {

    browser.submitItem = function() {
      this.execute('window.submit()');
      return this;
    };

    browser.waitForWithTimeout = function(selector){
      return browser.waitFor(selector, regressionTestRunnerGlobals.defaultTimeout);
    };

    browser
      .timeouts('implicit', regressionTestRunnerGlobals.defaultTimeout)
      .url(RegressionHelper.getUrl('match', itemJsonFilename))
      .waitForWithTimeout(answerInput('Row3'))
      .call(done);
  });

  it('does evaluate answers correctly', function(done) {
    browser
      .click(answerInput('Row1'))
      .click(answerInput('Row2'))
      .click(answerInput('Row3'))
      .submitItem()
      .waitForWithTimeout('.see-answer-panel .panel-heading')
      .isExisting(answerEvaluated('Row1', 'correct'), function(err,res){
        [err,res].should.eql([undefined,true], "Row1");
      })
      .isExisting(answerEvaluated('Row2', 'incorrect'), function(err,res){
        [err,res].should.eql([undefined,true], "Row2");
      })
      .isExisting(answerEvaluated('Row3', 'correct'), function(err,res){
        [err,res].should.eql([undefined,true], "Row3");
      })
      .call(done);
  });

  it('does show solution correctly', function(done) {
    browser
      .submitItem()
      .waitForWithTimeout('.see-answer-panel .panel-heading', function(){

      })
      .click('.see-answer-panel .panel-heading')
      .isExisting(correctAnswer('Row1'), function(err,res){
        [err,res].should.eql([undefined,true], "Row1");
      })
      .isExisting(correctAnswer('Row2'), function(err,res){
        [err,res].should.eql([undefined,true], "Row2");
      })
      .isExisting(correctAnswer('Row3'), function(err,res){
        [err,res].should.eql([undefined,true], "Row3");
      })
      .call(done);
  });

});