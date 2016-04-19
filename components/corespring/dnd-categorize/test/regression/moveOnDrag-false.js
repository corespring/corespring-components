/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');
var fs = require('fs');
var _ = require('lodash');

describe('dnd-categorize (dndc)', function() {

  "use strict";

  var componentName = 'dnd-categorize';
  var itemJsonFilename = 'moveOnDrag-false.json';

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    expect(browser.getTitle()).toBe('rig');
    browser.call(done);
  });

  describe('in instructor mode', function() {

    beforeEach(function(done) {
      browser.setInstructorMode();
      browser.call(done);

    });

    it('displays correct answers (dndcf-01)', function(done) {
      browser.waitForVisible('.cat_1 .choice_2.correct');
      browser.waitForVisible('.cat_3 .choice_1.correct');
      browser.waitForVisible('.cat_3 .choice_3.correct');
      browser.waitForVisible('.cat_4 .choice_2.correct');
      browser.waitForVisible('.cat_4 .choice_4.correct');
      browser.call(done);
    });

  });

  describe('when wrong answer is submitted (dndcf-02)', function() {
    beforeEach(function(done) {
      browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
      browser.submitItem();
      browser.call(done);
    });

    it('displays incorrect feedback (dndcf-03)', function(done) {
      browser.waitForVisible('.feedback.incorrect');
      browser.call(done);
    });

    it('displays "solution panel" (dndcf-04)', function(done) {
      browser.waitForVisible('.see-answer-panel');
      browser.call(done);
    });

    it('and clicked on solution-panel, correct answers are displayed (dndcf-05)', function(done) {
      browser.waitAndClick('.see-answer-panel .panel-heading');
      browser.waitForVisible('.see-answer-panel .cat_1 .choice_2.correct');
      browser.waitForVisible('.see-answer-panel .cat_3 .choice_1.correct');
      browser.waitForVisible('.see-answer-panel .cat_3 .choice_3.correct');
      browser.waitForVisible('.see-answer-panel .cat_4 .choice_2.correct');
      browser.waitForVisible('.see-answer-panel .cat_4 .choice_4.correct');
      browser.call(done);
    });
  });

  describe('when correct answer is submitted (dndcf-06)', function() {
    beforeEach(function(done) {
      browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_1');
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_3');
      browser.dragAndDropWithOffset('.choices-container .choice_3', '.cat_3');
      browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_4');
      browser.dragAndDropWithOffset('.choices-container .choice_4', '.cat_4');
      browser.submitItem();
      browser.call(done);
    });

    it('displays choices as categorized and correct (dndcf-07)', function(done) {
      browser.waitForVisible('.cat_1 .choice_2.correct');
      browser.waitForVisible('.cat_3 .choice_1.correct');
      browser.waitForVisible('.cat_3 .choice_3.correct');
      browser.waitForVisible('.cat_4 .choice_2.correct');
      browser.waitForVisible('.cat_4 .choice_4.correct');
      browser.call(done);
    });

    it('displays correct feedback (dndcf-08)', function(done) {
      browser.waitForVisible('.feedback.correct');
      browser.call(done);
    });

  });

  describe('when partially correct answer is submitted', function() {

    beforeEach(function(done) {
      browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_1');
      browser.submitItem();
      browser.call(done);
    });

    it('displays choice as categorized and correct (dndcf-09)', function(done) {
      browser.waitForVisible('.cat_1 .choice_2.correct');
      browser.call(done);
    });

    it('displays partial feedback (dndcf-10)', function(done) {
      browser.waitForVisible('.feedback.partial');
      browser.call(done);
    });

    it('displays "solution panel (dndcf-11)"', function(done) {
      browser.waitForVisible('.see-answer-panel');
      browser.call(done);
    });

  });

  describe('when multiple choices are dropped on category', function() {
    beforeEach(function(done) {
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_2');
      browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
      browser.dragAndDropWithOffset('.choices-container .choice_3', '.cat_2');
      browser.call(done);
    });

    it('displays choice as categorized (dndcf-12)', function(done) {
      browser.waitForVisible('.cat_2 .choice_1');
      browser.waitForVisible('.cat_2 .choice_2');
      browser.waitForVisible('.cat_2 .choice_3');
      browser.call(done);
    });
  });

  describe('when choice is dragged from category and dropped on other category', function() {
    beforeEach(function(done) {
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_2');
      browser.dragAndDropWithOffset('.cat_2 .choice_1', '.cat_1');
      browser.call(done);
    });

    it('displays choice as categorized (dndcf-13)', function(done) {
      browser.waitForVisible('.cat_1 .choice_1');
      browser.call(done);
    });
  });

  describe('when submitted without answer', function() {
    beforeEach(function(done) {
      browser.submitItem();
      browser.call(done);
    });

    it('displays warning (dndcf-14)', function(done) {
      browser.waitForVisible('.feedback.warning.answer-expected');
      browser.call(done);
    });
  });

  describe('when choices are set to moveOnDrag=false', function() {

    it('allows to drop the same choice multiple times on the same category (dndcf-15)', function(done) {
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
      browser.waitForVisible('.cat_1 .choice_1');
      browser.elements('.cat_1 .choice_1', function(err, res) {
        expect(res.value.length).toBe(3);
      });
      browser.call(done);
    });
    it('allows to drop the same choice multiple times on different categories (dndcf-16)', function(done) {
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_2');
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_3');
      browser.waitForVisible('.cat_1 .choice_1');
      browser.waitForVisible('.cat_2 .choice_1');
      browser.waitForVisible('.cat_3 .choice_1');
      browser.call(done);
    });
  });

  describe('clicking undo', function() {
    describe("when two choices have been placed", function() {

      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
        browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
        browser.waitAndClick('.btn-undo');
        browser.call(done);
      });

      it('should remove the second choice and leave the first one (dndcf-17)', function(done) {
        browser.waitForRemoval('.cat_2 .choice_2');
        browser.waitForVisible('.cat_1 .choice_1');
        browser.call(done);
      });

      it('should show the undo/startOver buttons as enabled (dndcf-18)', function(done) {
        browser.waitForVisible('.btn-undo');
        browser.getAttribute('.btn-undo', 'class', function(err, res) {
          expect(res).toNotContain('disabled');
        });
        browser.waitForVisible('.btn-start-over');
        browser.getAttribute('.btn-start-over', 'class', function(err, res) {
          expect(res).toNotContain('disabled');
        });
        browser.call(done);
      });

    });

    describe("when one choice has been placed", function() {

      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
        browser.waitAndClick('.btn-undo');
        browser.call(done);
      });

      it('should remove the choice (dndcf-19)', function(done) {
        browser.waitForRemoval('.cat_1 .choice_1');
        browser.call(done);
      });

      it('should show the undo/startOver buttons as disabled (dndcf-20)', function(done) {
        var invertWait;
        browser.waitForVisible('.btn-undo.disabled');
        browser.waitForVisible('.btn-start-over.disabled');
        browser.call(done);
      });

    });

  });

  describe('clicking startOver', function() {

    describe('when two choices have been placed', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
        browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
        browser.waitAndClick('.btn-start-over');
        browser.call(done);
      });

      it('should remove both choices from the categories (dndcf-21)', function(done) {
        browser.waitForRemoval('.cat_1 .choice_1');
        browser.waitForRemoval('.cat_2 .choice_2');
        browser.call(done);
      });

      it('should show the undo/startOver buttons as disabled (dndcf-22)', function(done) {
        browser.waitForVisible('.btn-undo.disabled');
        browser.waitForVisible('.btn-start-over.disabled');
        browser.call(done);
      });
    });

  });


});