/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');
var fs = require('fs');
var _ = require('lodash');


var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('drag and drop inline', function() {

  "use strict";

  var itemJsonFilename = 'one.json';
  var componentName = 'drag-and-drop-inline';
  var itemJson = RegressionHelper.getItemJson(componentName, itemJsonFilename);

  function landingPlace(id) {
    return "#" + id + " > div";
  }

  function choice(id) {
    return ".choice[data-choice-id='" + id + "']";
  }

  function selectedChoice(id) {
    return ".selected-choice[data-choice-id='" + id + "']";
  }

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  browser.dragAndDropWithOffset = function(fromSelector, toSelector){
    return this.moveToObject(fromSelector, 2, 2)
      .buttonDown()
      .moveToObject(toSelector, 2, 2)
      .buttonUp();
  };

  beforeEach(function() {
    browser
      .url(RegressionHelper.getUrl(componentName, itemJsonFilename))
      .waitFor('.render-csdndi', regressionTestRunnerGlobals.defaultTimeout);
  });

  it('correct answer results in correct feedback', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.correct', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('superfluous answer results in partial feedback', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.partial', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('incorrect answer results in incorrect feedback', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('incorrect answer is marked as incorrect', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('correct answer is marked as correct', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.correct', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('correct answer in wrong position is marked as incorrect', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('superfluous answer is marked as incorrect', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('selected choices are marked correctly', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.correct .fa-check-circle', regressionTestRunnerGlobals.defaultTimeout)
      .waitFor('.selected-choice.incorrect .fa-times-circle', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('shows warning when no item is selected', function(done) {
    browser
      .submitItem()
      .waitFor('.feedback.warning', regressionTestRunnerGlobals.defaultTimeout)
      .getText('.feedback.warning', function(err,res){
        expect(res).toEqual('You did not enter a response.');
      })
      .waitFor('.empty-answer-area-warning', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it("removes choice when moveOnDrag is true and choice has been placed", function(done){
    browser
      .isExisting(choice('c_4'), function(err,res){
        expect("choice exists: " + res).toBe("choice exists: true");
      })
      .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
      .isExisting(choice('c_4'), function(err,res){
        expect("choice removed: " + !res).toBe("choice removed: true");
      })
      .call(done);
  });

  it("shows correct answer area if answer is incorrect", function(done){
    browser
      .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.correct-answer-area-holder', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  describe("math", function(){
    it("renders math in choice", function(done){
      browser
        .isExisting(choice('c_4') + ' .MathJax_Preview', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });
    it("renders math in answer area text", function(done){
      browser
        .isExisting('.answer-area-holder .MathJax_Preview', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });
    it("renders math in selected choice", function(done){
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .isExisting('.answer-area-holder .selected-choice .MathJax_Preview', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });
    it("renders math in correct answer area", function(done){
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .submitItem()
        .click('h4.panel-title')
        .isExisting('.correct-answer-area-holder .MathJax_Preview', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });

  });

  it("allows drag and drop inside one answer area", function(done){
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.correct', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  //doesn't work, something wrong with the sortable?
  //it doesn't seem to highlight the answer areas if you do it manually
  it("allows drag and drop between answer areas", function(done){
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_2'))
      .dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.correct', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  //doesn't work, something wrong with the sortable?
  //it doesn't seem to highlight the answer areas if you do it manually
  it("allows removing a choice by dragging it out of answer area", function(done){
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .moveToObject(selectedChoice('c_2'), 2, 2)
      .buttonDown()
      .moveTo(null, 0, 200)
      .buttonUp()
      .isExisting(selectedChoice('c_2'), function(err,res){
        expect("selected choice removed: " + !res).toBe("selected choice removed: true");
      })
      .call(done);
  });

});
