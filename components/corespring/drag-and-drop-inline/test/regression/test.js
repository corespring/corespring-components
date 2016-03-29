/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');
var fs = require('fs');
var _ = require('lodash');

describe('drag and drop inline', function() {

  "use strict";

  var itemJsonFilename = 'one.json';
  var componentName = 'drag-and-drop-inline';

  function landingPlace(id) {
    return "#" + id + " > div";
  }

  function choice(id) {
    return ".choice[data-choice-id='" + id + "']";
  }

  function selectedChoice(id) {
    return ".selected-choice[data-choice-id='" + id + "']";
  }

  browser.dragAndDropWithOffset = function(fromSelector, toSelector) {
    this.moveToObject(fromSelector, 20, 4);
    this.buttonDown(0);
    this.pause(500);
    this.moveToObject(toSelector, 20, 10);
    this.pause(500);
    this.buttonUp();
    this.pause(500);
    return this;
  };

  beforeEach(function(done) {
    browser.url(browser.getTestUrl(componentName, itemJsonFilename));
    browser.waitForVisible(choice('c_1'));
    browser.waitForVisible(choice('c_2'));
    browser.waitForVisible(choice('c_3'));
    browser.waitForVisible(choice('c_4'));
    browser.waitForVisible(landingPlace('aa_1'));
    browser.call(done);
  });

  it('correct answer results in correct feedback', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback.correct');
    browser.call(done);
  });

  it('superfluous answer results in partial feedback', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback.partial');
    browser.call(done);
  });

  it('incorrect answer results in incorrect feedback', function(done) {
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback.incorrect');
    browser.call(done);
  });

  it('incorrect answer is marked as incorrect', function(done) {
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.incorrect');
    browser.call(done);
  });

  it('correct answer is marked as correct', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.correct');
    browser.call(done);
  });

  it('correct answer in wrong position is marked as incorrect', function(done) {
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.incorrect');
    browser.call(done);
  });

  it('superfluous answer is marked as incorrect', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.incorrect');
    browser.call(done);
  });

  it('selected choices are marked correctly', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.correct .fa-check-circle');
    browser.waitForVisible('.selected-choice.incorrect .fa-times-circle');
    browser.call(done);
  });

  it('shows warning when no item is selected', function(done) {
    browser.submitItem();
    browser.waitForVisible('.empty-answer-area-warning');
    browser.waitForText('.feedback.warning');
    expect(browser.getText('.feedback.warning')).toBe('You did not enter a response.');
    browser.call(done);
  });

  it("removes choice when moveOnDrag is true and choice has been placed", function(done){
    var waitForNotVisible;

    browser.waitForVisible(choice('c_4'));
    browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
    browser.waitForVisible(choice('c_4'), 2000, waitForNotVisible=true);
    browser.call(done);
  });

  describe('correct answer area', function(){
    it("is shown, if answer is incorrect", function(done){
      browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
      browser.submitItem();
      browser.waitForVisible('.see-solution');
      browser.call(done);
    });

    it("is hidden, if answer is correct", function(done){
      var waitForNotVisible;

      browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
      browser.submitItem();
      browser.waitForVisible('.see-solution', 2000, waitForNotVisible = true);
      browser.call(done);
    });

    it("renders correct answer if answer is incorrect", function(done){
      browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
      browser.submitItem();
      browser.waitForVisible('.see-solution .panel-heading');
      browser.click('.see-solution .panel-heading');
      browser.waitForVisible('.correct-answer-area-holder .answer-area-inline');
      browser.waitForVisible(selectedChoice('c_2'));
      browser.call(done);
    });
  });

  describe("math", function(){
    it("renders math in choice", function(done){
      browser.waitForExist(choice('c_4') + ' .MathJax_Preview');
      browser.call(done);
    });

    it("renders math in answer area text", function(done){
      browser.waitForExist('.answer-area-holder .MathJax_Preview');
     browser.call(done);
    });

    it("renders math in selected choice", function(done){
      browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
     browser.waitForExist('.answer-area-holder .selected-choice .MathJax_Preview');
     browser.call(done);
    });

    it("renders math in correct answer area", function(done){
      browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
     browser.submitItem();
     browser.click('h4.panel-title');
     browser.waitForExist('.correct-answer-area-holder .MathJax_Preview');
     browser.call(done);
    });

  });

  it("allows drag and drop inside one answer area", function(done){
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback.correct');
    browser.call(done);
  });

  it("allows drag and drop between answer areas", function(done){
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_2'));
    browser.dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback.correct');
    browser.call(done);
  });

  it("allows removing a choice by dragging it out of answer area", function(done){
    var waitForNotVisible;

    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.moveToObject(selectedChoice('c_2'), 2, 2);
    browser.buttonDown();
    browser.moveTo(null, 0, 200);
    browser.buttonUp();
    browser.waitForVisible(selectedChoice('c_2'), 2000, waitForNotVisible=true);
    browser.call(done);
  });

});
