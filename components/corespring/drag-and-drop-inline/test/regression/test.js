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

  beforeEach(function(done) {
    browser.options.extendBrowser(browser);

    browser
      .loadTest(componentName, itemJsonFilename)
      .call(done);
  });

  describe('instructor mode', function(){

    beforeEach(function(done){
      browser
        .setInstructorMode()
        .call(done);

    });

    it('displays correct answer', function(done) {
      browser
        .waitForExist(selectedChoice("c_2"))
        .call(done);
    });

    it('does not display see-solution', function(done) {
      var invertCallAndWaitForHidden;
      browser
        .waitForVisible('.see-solution', 2000, invertCallAndWaitForHidden = true)
        .call(done);
    });

    it('displays all choices as disabled', function(done) {
      browser
        .waitForVisible(choice('c_1') + '.ui-draggable-disabled')
        .waitForVisible(choice('c_2') + '.ui-draggable-disabled')
        .waitForVisible(choice('c_3') + '.ui-draggable-disabled')
        .waitForVisible(choice('c_4') + '.ui-draggable-disabled')
        .call(done);
    });

  });

  it('correct answer results in correct feedback', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.feedback.correct')
      .call(done);
  });

  it('superfluous answer results in partial feedback', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.feedback.partial')
      .call(done);
  });

  it('incorrect answer results in incorrect feedback', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.feedback.incorrect')
      .call(done);
  });

  it('incorrect answer is marked as incorrect', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.selected-choice.incorrect')
      .call(done);
  });

  it('correct answer is marked as correct', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.selected-choice.correct')
      .call(done);
  });

  it('correct answer in wrong position is marked as incorrect', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.selected-choice.incorrect')
      .call(done);
  });

  it('superfluous answer is marked as incorrect', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.selected-choice.incorrect')
      .call(done);
  });

  it('selected choices are marked correctly', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.selected-choice.correct .fa-check-circle')
      .waitForExist('.selected-choice.incorrect .fa-times-circle')
      .call(done);
  });

  it('shows warning when no item is selected', function(done) {
    browser
      .submitItem()
      .waitForExist('.empty-answer-area-warning')
      .waitForText('.feedback.warning')
      .getText('.feedback.warning', function(err, res) {
        expect(res).toEqual('You did not enter a response.');
      })
      .call(done);
  });

  it("removes choice when moveOnDrag is true and choice has been placed", function(done) {
    browser
      .isExisting(choice('c_4'), function(err, res) {
        expect(res).toBe(true, "Expected choice to exist before moving");
      })
      .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
      .isExisting(choice('c_4'), function(err, res) {
        expect(res).toBe(false, "expected choice to be removed");
      })
      .call(done);
  });

  describe('correct answer area', function() {
    it("is shown, if answer is incorrect", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .submitItem()
        .waitForExist('.see-solution')
        .isVisible('.see-solution')
        .call(done);
    });

    it("is hidden, if answer is correct", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
        .submitItem()
        .waitForExist('.see-solution')
        .isVisible('.see-solution', function(err, res) {
          expect(res).toBe(false);
        })
        .call(done);
    });

    it("renders correct answer if answer is incorrect", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .submitItem()
        .waitAndClick('.see-solution .panel-heading')
        .waitForExist('.correct-answer-area-holder .answer-area-inline')
        .waitForExist(selectedChoice('c_2'))
        .isVisible(selectedChoice('c_2'), function(err, res) {
          expect(res).toBe(true, "Expected correct choice c_2 to be visible. Err:" + err);
        })
        .call(done);
    });
  });

  describe("math", function() {
    it("renders math in choice", function(done) {
      browser
        .waitForExist(choice('c_4') + ' .MathJax_Preview')
        .call(done);
    });
    it("renders math in answer area text", function(done) {
      browser
        .waitForExist('.answer-area-holder .MathJax_Preview')
        .call(done);
    });
    it("renders math in selected choice", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .waitForExist('.answer-area-holder .selected-choice .MathJax_Preview')
        .call(done);
    });
    it("renders math in correct answer area", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .submitItem()
        .waitAndClick('h4.panel-title')
        .waitForExist('.correct-answer-area-holder .MathJax_Preview')
        .call(done);
    });

  });

  it("allows drag and drop inside one answer area", function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.feedback.correct')
      .call(done);
  });

  it("allows drag and drop between answer areas", function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_2'))
      .dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForExist('.feedback.correct')
      .call(done);
  });

  it("allows removing a choice by dragging it out of answer area", function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .moveToObject(selectedChoice('c_2'), 2, 2)
      .buttonDown()
      .moveTo(null, 0, 200)
      .buttonUp()
      .waitForExist(selectedChoice('c_2'), 2000, true)
      .isExisting(selectedChoice('c_2'), function(err, res) {
        expect(res).toBe(false, "expected selected choice to be removed");
      })
      .call(done);
  });

});