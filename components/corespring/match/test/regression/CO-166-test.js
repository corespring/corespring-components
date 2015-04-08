/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('match', function() {

  "use strict";

  var itemJsonFilename = 'CO-166.json';
  var itemJson = RegressionHelper.getItemJson('match', itemJsonFilename);

  function answerInput(questionId){
    return '.question-row[question-id="' + questionId + '"] .choice-input';
  }

  function answerEvaluated(questionId, correctness){
    return '.question-row[question-id="' + questionId + '"] ' + correctness;
  }

  function correctAnswer(questionId){
    return '.panel-body .question-row[question-id="' + questionId + '"] .correct[ng-value="true"]';
  }

  beforeEach(function(done) {

    browser.submitItem = function() {
      this.execute('window.submit()');
      return this;
    };

    browser
      .timeouts('implicit', regressionTestRunnerGlobals.defaultTimeout)
      .url(RegressionHelper.getUrl('match', itemJsonFilename))
      .call(done);
  });

  it('does evaluate answers correctly', function(done) {
    browser
      .click(answerInput('Row1'))
      .click(answerInput('Row2'))
      .click(answerInput('Row3'))
      .submitItem()
      .waitFor('.see-answer-panel .panel-heading')
      .isExisting(answerEvaluated('Row1', 'correct'))
      .isExisting(answerEvaluated('Row2', 'incorrect'))
      .isExisting(answerEvaluated('Row3', 'correct'))
      .call(done);
  });

  it('does show solution correctly', function(done) {
    browser
      .submitItem()
      .waitFor('.see-answer-panel .panel-heading')
      .isExisting(correctAnswer('Row1'))
      .isExisting(correctAnswer('Row2'))
      .isExisting(correctAnswer('Row3'))
      .call(done);
  });

});