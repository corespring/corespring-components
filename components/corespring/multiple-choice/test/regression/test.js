/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('multiple-choice', function() {

  "use strict";

  var itemJsonFilename = 'one.json';
  var itemJson = browser.options.getItemJson('multiple-choice', itemJsonFilename);

  function findChoice(id){
    return _.find(itemJson.item.components['1'].model.choices, function(choice) {
      return choice.value === id;
    });
  }

  function findOtherChoice(notThisOne){
    return _.find(itemJson.item.components['1'].model.choices, function(choice) {
      return choice.value !== notThisOne;
    });
  }

  function findFeedback(id){
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
        browser.elementIdAttribute(element, 'value', function(err, res) {
          if (res.value === answer) {
            browser.elementIdClick(element);
          }
        });
      }

      this.elements('.choice-input .radio-choice', function(err, results) {
        for (var i = 0; i < results.value.length; i++) {
          clickIfAnswer(results.value[i].ELEMENT);
        }
      });

      return this;
    };

    browser.showAnswer = function() {
      browser.elements('.answer-holder .panel-title', function(err, results) {
        for (var i = 0; i < results.value.length; i++) {
          browser.elementIdClick(results.value[i].ELEMENT);
        }
      });
      return this;

    };

    browser.submitItem = function() {
      console.log("submitting");
      this.execute('window.submit()');
      return this;
    };

    browser
      .url(browser.options.getUrl('multiple-choice', itemJsonFilename))
      .waitForVisible('.player-rendered')
      .call(done);
  });


  it('does not display incorrect feedback when correct answer selected', function(done) {
    browser
      .selectAnswer(correctAnswer)
      .submitItem()
      .isVisible('.selected .choice-holder.incorrect', function(err, result) {
        (result === undefined).should.equal(true);
      })
      .call(done);

  });

  it('displays incorrect feedback when incorrect answer selected', function(done) {
    browser
      .selectAnswer(incorrectAnswer)
      .submitItem()
      .isVisible('.selected .choice-holder.incorrect', function(err, result) {
        (result === null).should.not.equal(true);
      })
      .call(done);
  });

  it('displays correct answer in answer area when incorrect answer selected', function(done) {
    browser
      .selectAnswer(incorrectAnswer)
      .submitItem()
      .showAnswer()
      .waitForText('.answer-holder .choice-holder.correct .choice-label')
      .getText('.answer-holder .choice-holder.correct .choice-label', function(err, message) {
        message.should.eql(correctAnswerLabel);
      })
      .call(done);
  });

  it('MathJax renders', function(done) {
    browser
      .waitFor('.choice-label .MathJax_Preview')
      .call(done);
  });

});
