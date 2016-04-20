/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('multiple-choice', function() {

  "use strict";

  var componentName = 'multiple-choice';
  var itemJsonFilename = 'one.json';
  var itemJson = browser.getItemJson('multiple-choice', itemJsonFilename);

  function findChoice(id){
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


  beforeEach(function(done) {
    browser.selectAnswer = function(answer) {

      function clickIfAnswer(element) {
        var res = browser.elementIdAttribute(element, 'value');
        if (res.value === answer) {
           browser.elementIdClick(element);
        }
      }

      var results = browser.elements('.choice-input .radio-choice');
      for (var i = 0; i < results.value.length; i++) {
        clickIfAnswer(results.value[i].ELEMENT);
      }
      return browser;
    };

    browser.showAnswer = function() {
      var selector = '.answer-holder .panel-title';
      browser.waitForVisible(selector);
      browser.click(selector);
      browser.waitForVisible('.answer-holder .panel-body');
      return browser;
    };

    browser.loadTest(componentName, itemJsonFilename);
    browser.call(done);
  });

  it('does not display incorrect feedback when correct answer selected', function(done) {
    browser.selectAnswer(correctAnswer);
    browser.submitItem();
    browser.waitForVisible('.selected.incorrect .choice-holder', browser.options.defaultTimeout, true);
    browser.call(done);
  });

  it('does display correct feedback when correct answer selected', function(done) {
    browser.selectAnswer(correctAnswer);
    browser.submitItem();
    browser.waitForVisible('.selected.correct .choice-holder', browser.options.defaultTimeout, true);
    browser.call(done);
  });

  it('displays incorrect feedback when incorrect answer selected', function(done) {
    browser.selectAnswer(incorrectAnswer);
    browser.submitItem();
    browser.waitForVisible('.selected.incorrect .choice-holder');
    browser.call(done);
  });

  it('displays warning when no answer selected', function(done) {
    browser.submitItem();
    browser.waitForVisible('.answer-holder .alert-danger');
    var message = browser.getText('.answer-holder .alert-danger');
    message.should.equal('You did not enter a response.');
    browser.call(done);
  });


  it('displays correct answer in answer area when incorrect answer selected', function(done) {
    browser.selectAnswer(incorrectAnswer);
    browser.submitItem();
    browser.showAnswer();
    browser.waitForVisible('.answer-holder .choice-holder.correct .choice-label');
    var message = browser.getText('.answer-holder .choice-holder.correct .choice-label');
    message.should.eql(correctAnswerLabel);
    browser.call(done);
  });

  it('MathJax renders', function(done) {
    browser.waitForExist('.choice-label .MathJax_Preview');
    browser.call(done);
  });

});