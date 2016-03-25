/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var _ = require('lodash');

describe('multiple-choice', function() {

  "use strict";

  var itemJsonFilename = 'one.json';
  var itemJson = browser.getItemJson('multiple-choice', itemJsonFilename);

  function findChoice(id) {
    return _.find(itemJson.item.components['1'].model.choices, function(choice) {
      return choice.value === id;
    });
  }

  function findOtherChoice(notThisOne) {
    return _.find(itemJson.item.components['1'].model.choices, function(choice) {
      return choice.value !== notThisOne;
    });
  }

  function findFeedback(id) {
    return _.find(itemJson.item.components['1'].feedback, function(feedback) {
      return feedback.value === id;
    });
  }

  var correctAnswer = itemJson.item.components['1'].correctResponse.value[0];
  var correctAnswerLabel = findChoice(correctAnswer).label;
  var incorrectAnswer = findOtherChoice(correctAnswer).value;
  var notChosenFeedback = findFeedback(correctAnswer).notChosenFeedback;

  browser.submitItem = function() {
    console.log("submitting");
    this.execute('window.submit()');
    return this;
  };

  beforeEach(function(done) {
    browser.url(browser.getTestUrl('multiple-choice', itemJsonFilename));
    browser.waitForVisible('.choice-input .radio-choice');
    browser.call(done);
  });

  it('displays "no answer selected" warning, when no answer has been choosen', function(done){
    browser.submitItem();
    browser.waitForText('.alert.alert-danger');
    browser.getText('.alert.alert-danger').should.eql('You did not enter a response.')
    browser.call(done);
  });

  it('does display correct feedback when correct answer selected', function(done) {
    browser.click('.choice-input .radio-choice[value=' + correctAnswer + ']');
    browser.submitItem();
    browser.waitForVisible('.selected.correct');
    browser.call(done);
  });


  it('does not display incorrect feedback when correct answer selected', function(done) {
    var waitForNotVisible;

    browser.click('.choice-input .radio-choice[value=' + correctAnswer + ']');
    browser.submitItem();
    browser.waitForVisible('.selected.incorrect', 2000, waitForNotVisible=true);
    browser.call(done);
  });

  it('does display incorrect feedback when incorrect answer selected', function(done) {
    browser.click('.choice-input .radio-choice[value=' + incorrectAnswer + ']');
    browser.submitItem();
    browser.waitForVisible('.selected.incorrect');
    browser.call(done);
  });

  it('does not display incorrect feedback when correct answer selected', function(done) {
    var waitForNotVisible;

    browser.click('.choice-input .radio-choice[value=' + correctAnswer + ']');
    browser.submitItem();
    browser.waitForVisible('.selected.incorrect', 2000, waitForNotVisible=true);
    browser.call(done);
  });

  it('displays see solution panel when answer is incorrect', function(done){
    browser.click('.choice-input .radio-choice[value=' + incorrectAnswer + ']');
    browser.submitItem();
    browser.waitForVisible('.answer-holder .panel-heading');
    browser.call(done);
  });

  it('does not display see solution panel when answer is correct', function(done){
    var waitForNotVisible;

    browser.click('.choice-input .radio-choice[value=' + correctAnswer + ']');
    browser.submitItem();
    browser.waitForVisible('.answer-holder .panel-heading', 2000, waitForNotVisible=true);
    browser.call(done);
  });

  it('displays correct answer in answer area when answer is incorrect', function(done) {
    browser.click('.choice-input .radio-choice[value=' + incorrectAnswer + ']');
    browser.submitItem();
    browser.waitForVisible('.answer-holder .panel-heading');
    browser.click('.answer-holder .panel-heading')
    browser.waitForVisible('.answer-holder .correct.selected .choice-label');
    browser.getText('.answer-holder .correct.selected .choice-label').should.eql(correctAnswerLabel);
    browser.call(done);
  });

  it('MathJax renders', function(done) {
    browser.waitForExist('.choice-label .MathJax_Preview');
    browser.call(done);
  });

});