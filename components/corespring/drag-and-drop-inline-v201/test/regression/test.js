/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');
var fs = require('fs');
var _ = require('lodash');


var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('drag and drop inline v201', function() {

  "use strict";

  var itemJsonFilename = 'one.json';
  var componentName = 'drag-and-drop-inline-v201';
  var itemJson = RegressionHelper.getItemJson(componentName, itemJsonFilename);

  function landingPlace(id) {
    return "//div[@id='" + id  + "']/div[1]";
  }

  function choice(id) {
    return "//div[@data-id='" + id + "']";
  }

  function elementWithClass(s) {
    return "//*[@class[contains(., '" + s + "')]]";
  }


  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  beforeEach(function() {
    browser
      .url(RegressionHelper.getUrl(componentName, itemJsonFilename))
      .waitFor('.corespring-drag-and-drop-inline-render-v201', regressionTestRunnerGlobals.defaultTimeout);
  });

  xit('correct answer results in correct feedback', function(done) {
    browser
      .waitFor(choice('c_2'))
      .getHTML(choice('c_2'), function(err,res){
        console.log("getHTML c2: ", res);
      })
      .waitFor(landingPlace('aa_1'))
      .getHTML(landingPlace('aa_1'), function(err,res){
        console.log("getHTML aa_1: ", res);
      })
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.correct', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  xit('superfluous answer results in partial feedback', function(done) {
    browser
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.partial', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  xit('incorrect answer results in incorrect feedback', function(done) {
    browser
      .dragAndDrop(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  xit('incorrect answer is marked as incorrect', function(done) {
    browser
      .dragAndDrop(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  xit('correct answer is marked as correct', function(done) {
    browser
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .dragAndDrop(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.correct', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  xit('correct answer in wrong position is marked as incorrect', function(done) {
    browser
      .dragAndDrop(choice('c_1'), landingPlace('aa_1'))
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  xit('superfluous answer is marked as incorrect', function(done) {
    browser
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  xit('selected choices are marked correctly', function(done) {
    browser
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .dragAndDrop(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.correct .fa-check-circle', regressionTestRunnerGlobals.defaultTimeout)
      .waitFor('.selected-choice.incorrect .fa-times-circle', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  xit('shows warning when no item is selected', function(done) {
    browser
      .submitItem()
      .waitFor('.feedback.warning', regressionTestRunnerGlobals.defaultTimeout)
      .getText('.feedback.warning', function(err,res){
        expect(res).toEqual('You did not enter a response.');
      })
      .waitFor('.empty-answer-area-warning', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  xit("removes choice when removeAfterPlacing is true and choice has been placed", function(done){
    browser
      .isExisting(choice('c_4'), function(err,res){
        expect(res).toBe(true);
      })
      .dragAndDrop(choice('c_4'), landingPlace('aa_1'))
      .submitItem()
      .isExisting(choice('c_4'), function(err,res){
        expect(res).toBe(false);
      })
      .call(done);
  });

  xit("shows correct answer area if answer is incorrect", function(done){
    browser
      .dragAndDrop(choice('c_4'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.correct-answer-area-holder', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  describe("math", function(){
    xit("renders math in choice", function(done){
      browser
        .isExisting(choice('c_4') + ' ' + elementWithClass('MathJax_Preview'), regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });
    xit("renders math in answer area text", function(done){
      browser
        .isExisting('.answer-area-holder .MathJax_Preview', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });
    xit("renders math in selected choice", function(done){
      browser
        .dragAndDrop(choice('c_4'), landingPlace('aa_1'))
        .isExisting('.answer-area-holder .selected-choice .MathJax_Preview', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });
    xit("renders math in correct answer area", function(done){
      browser
        .dragAndDrop(choice('c_4'), landingPlace('aa_1'))
        .submitItem()
        .click('h4.panel-title')
        .isExisting('.correct-answer-area-holder .MathJax_Preview', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });

  });


});
