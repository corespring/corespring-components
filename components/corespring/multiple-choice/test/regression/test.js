/* global browser, regressionTestRunnerGlobals */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('multiple-choice', function() {

  var itemJsonFilename = 'one.json';
  var itemJson = RegressionHelper.getItemJson('multiple-choice', itemJsonFilename);
  var correctAnswer = itemJson.item.components['1'].correctResponse.value[0];

  var incorrectAnswer = _.find(itemJson.item.components['1'].model.choices, function(choice) {
    return choice.value !== correctAnswer;
  }).value;

  var notChosenFeedback = _.find(itemJson.item.components['1'].feedback, function(feedback) {
    return feedback.value === correctAnswer;
  }).notChosenFeedback;

  browser.selectAnswer = function(answer) {

    function clickIfAnswer(element) {
      browser.elementIdAttribute(element, 'value', function(err, res) {
        if (res.value === answer) {
          browser.elementIdClick(element);
        }
      });
    }

    this.elements('.choice-input input', function(err, results) {
      for (var i = 0; i < results.value.length; i++) {
        clickIfAnswer(results.value[i].ELEMENT);
      }
    });

    return this;
  };

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  beforeEach(function() {
    browser
      .url(RegressionHelper.getUrl('multiple-choice', itemJsonFilename))
      .waitFor('.choice-input input', regressionTestRunnerGlobals.defaultTimeout);
  });


  it('does not display incorrect feedback when correct answer selected', function(done) {
    browser
      .selectAnswer(correctAnswer)
      .submitItem()
      .isVisible('.choice-holder.incorrect', function(err, result) {
        (result === null).should.equal(true);
      })
      .call(done);

  });

  it('displays incorrect feedback when incorrect answer selected', function(done) {
    browser
      .selectAnswer(incorrectAnswer)
      .submitItem()
      .isVisible('.choice-holder.incorrect', function(err, result) {
        (result === null).should.not.equal(true);
      })
      .call(done);
  });

  it('displays correct answer help message when incorrect answer selected', function(done) {
    browser
      .selectAnswer(incorrectAnswer)
      .submitItem()
      .getText('.choice-feedback-holder .cs-feedback.correct', function(err, message) {
        message.should.eql(notChosenFeedback);
      })
      .call(done);
  });

});
