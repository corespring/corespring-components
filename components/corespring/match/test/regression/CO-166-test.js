/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('match', function() {

  "use strict";

  var itemJsonFilename = 'CO-166.json';

  function answerInput(questionId) {
    return '.question-row[question-id="' + questionId + '"] .corespring-match-choice.input';
  }

  function answerEvaluated(questionId, correctness) {
    return '.question-row[question-id="' + questionId + '"] .' + correctness;
  }

  function correctAnswer(questionId) {
    return '.see-answer-panel .panel-body .question-row[question-id="' + questionId + '"] .correct';
  }

  function solutionPanelHeader() {
    return '.see-answer-panel .panel .panel-heading';
  }

  beforeEach(function(done) {

    browser.url(browser.getTestUrl('match', itemJsonFilename));
    browser.waitForExist(answerInput('Row3'));
    browser.call(done);
  });

  it('does evaluate answers correctly', function(done) {
    browser.click(answerInput('Row1'));
    browser.click(answerInput('Row2'));
    browser.click(answerInput('Row3'));
    browser.submitItem();
    browser.waitForVisible(answerEvaluated('Row1', 'correct'));
    browser.waitForVisible(answerEvaluated('Row2', 'incorrect'));
    browser.waitForVisible(answerEvaluated('Row3', 'correct'));
    browser.call(done);
  });

  it('does show solution correctly', function(done) {
    browser.click(answerInput('Row1'));
    browser.submitItem();
    browser.waitForExist(solutionPanelHeader());
    browser.click(solutionPanelHeader());
    browser.waitForVisible(correctAnswer('Row1'));
    browser.waitForVisible(correctAnswer('Row2'));
    browser.waitForVisible(correctAnswer('Row3'));

    browser.call(done);
  });


});