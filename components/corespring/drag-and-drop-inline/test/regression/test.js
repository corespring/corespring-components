/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');
var fs = require('fs');
var _ = require('lodash');

describe('drag-and-drop-inline (dndi)', function() {

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

    it('displays correct answer [] (dndi-01)', function(done) {
      browser
        .waitForVisible(selectedChoice("c_2"))
        .call(done);
    });

    it('does not display see-solution (dndi-02)', function(done) {
      var waitForHidden;
      browser
        .waitForVisible('.see-solution', 2000, waitForHidden = true)
        .call(done);
    });

    it('displays all choices as disabled (dndi-03)', function(done) {
      browser
        .waitForVisible(choice('c_1') + '.ui-draggable-disabled')
        .waitForVisible(choice('c_2') + '.ui-draggable-disabled')
        .waitForVisible(choice('c_3') + '.ui-draggable-disabled')
        .waitForVisible(choice('c_4') + '.ui-draggable-disabled')
        .call(done);
    });

  });

  it('correct answer results in correct feedback (dndi-04)', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.feedback.correct')
      .call(done);
  });

  it('superfluous answer results in partial feedback (dndi-05)', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.feedback')
      .getAttribute('.feedback', 'class', function(err,res){
        expect(res).toContain('partial');
      })
      .call(done);
  });

  it('incorrect answer results in incorrect feedback (dndi-06)', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.feedback.incorrect')
      .call(done);
  });

  it('incorrect answer is marked as incorrect (dndi-07)', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.selected-choice.incorrect')
      .call(done);
  });

  it('correct answer is marked as correct (dndi-08)', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.selected-choice.correct')
      .call(done);
  });

  it('correct answer in wrong position is marked as incorrect (dndi-09)', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.selected-choice.incorrect')
      .call(done);
  });

  it('superfluous answer is marked as incorrect (dndi-10)', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.selected-choice.incorrect')
      .call(done);
  });

  it('selected choices are marked correctly (dndi-11)', function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.selected-choice.correct .fa-check-circle')
      .waitForVisible('.selected-choice.incorrect .fa-times-circle')
      .call(done);
  });

  it('shows warning when no item is selected (dndi-12)', function(done) {
    browser
      .submitItem()
      .waitForVisible('.empty-answer-area-warning')
      .waitForText('.feedback.warning')
      .getText('.feedback.warning', function(err, res) {
        expect(res).toEqual('You did not enter a response.');
      })
      .call(done);
  });

  it("removes choice when moveOnDrag is true and choice has been placed (dndi-13)", function(done) {
    browser
      .waitForVisible(choice('c_4'))
      .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
      .waitFor(choice('c_4') + ".placed")
      .call(done);
  });

  describe('correct answer area (dndi-14)', function() {
    it("is shown, if answer is incorrect", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .submitItem()
        .waitForVisible('.see-solution')
        .call(done);
    });

    it("is hidden, if answer is correct (dndi-15)", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
        .submitItem()
        .waitFor('.see-solution')
        .isVisible('.see-solution', function(err, res) {
          expect(res).toBe(false);
        })
        .call(done);
    });

    it("renders correct answer if answer is incorrect (dndi-16)", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .submitItem()
        .waitAndClick('.see-solution .panel-heading')
        .waitFor('.correct-answer-area-holder .answer-area-inline')
        .waitForVisible(selectedChoice('c_2'))
        .call(done);
    });
  });

  describe("math", function() {
    it("renders math in choice (dndi-17)", function(done) {
      browser
        .waitForVisible(choice('c_4') + ' .MathJax_Preview')
        .call(done);
    });
    it("renders math in answer area text (dndi-18)", function(done) {
      browser
        .waitForVisible('.answer-area-holder .MathJax_Preview')
        .call(done);
    });
    it("renders math in selected choice (dndi-19)", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .waitForVisible('.answer-area-holder .selected-choice .MathJax_Preview')
        .call(done);
    });
    it("renders math in correct answer area (dndi-20)", function(done) {
      browser
        .dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'))
        .submitItem()
        .waitAndClick('h4.panel-title')
        .waitForVisible('.correct-answer-area-holder .MathJax_Preview')
        .call(done);
    });

  });

  it("allows drag and drop inside one answer area (dndi-21)", function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.feedback.correct')
      .call(done);
  });

  it("allows drag and drop between answer areas (dndi-22)", function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_2'))
      .dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitForVisible('.feedback.correct')
      .call(done);
  });

  it("allows removing a choice by dragging it out of answer area (dndi-23)", function(done) {
    browser
      .dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'))
      .moveToObject(selectedChoice('c_2'), 2, 2)
      .buttonDown()
      .moveTo(null, 0, 200)
      .buttonUp()
      .waitForRemoval(selectedChoice('c_2'))
      .call(done);
  });

  it('should keep the position of choices, when one is dragged away (dndi-24)', function(done){
      var location = {x:-1, y:-1};
      browser
        .waitFor(choice('c_2'))
        .getLocation(choice('c_2'), function(err,res){
          location = res;
        })
        .dragAndDropWithOffset(choice('c_1'), landingPlace('aa_2'))
        .getLocation(choice('c_2'), function(err,res){
          expect(res).toEqual(location);
        })
        .call(done);
  });

});