/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

describe('dnd-categorize', function() {

  "use strict";

  describe('moveOnDrag=true', function() {

    var itemJsonFilename = 'moveOnDrag-true.json';

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

    beforeEach(function() {
      browser.url(browser.getTestUrl('dnd-categorize', itemJsonFilename));
      browser.waitForVisible('.choice_1');
      browser.waitForVisible('.choice_2');
      browser.waitForVisible('.choice_3');
      browser.waitForVisible('.choice_4');
      browser.waitForVisible('.cat_1');
      browser.waitForVisible('.cat_2');
      browser.waitForVisible('.cat_3');
      browser.waitForVisible('.cat_4');
    });

    describe('undo', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
        browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
        browser.click('.btn-undo');
        browser.call(done);
      });

      it('should revert choice_2 but leave choice_1', function(done) {
        browser.waitForVisible('.choices-container .choice_2');
        browser.waitForExist('.choices-container .choice_1.placed');
        browser.call(done);
      });

    });

    describe('startOver', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
        browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
        browser.click('.btn-start-over');
        browser.call(done);
      });

      it('should render both choices as visible in the choices container', function(done) {
        browser.waitForVisible('.choices-container .choice_1');
        browser.waitForVisible('.choices-container .choice_2');
        browser.call(done);
      });

    });

    describe('move choice to category', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
        browser.call(done);
      });

      it('should render the empty space as placed', function(done) {
        browser.waitForExist('.choices-container .choice_2.placed');
        browser.call(done);
      });

      it('should render the choice as categorized', function(done) {
        browser.waitForVisible('.cat_2 .choice_2');
        browser.call(done);
      });

    });

    describe('move choice back to choices', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
        browser.dragAndDropWithOffset('.cat_2 .choice_2', '.choices-container');
        browser.call(done);
      });

      it('should render the choice as visible', function(done) {
        browser.waitForVisible('.choices-container .choice_2');
        browser.call(done);
      });

    });

    describe('instructor mode', function() {
      beforeEach(function(done) {
        browser.setInstructorMode();
        browser.call(done);

      });

      it('displays correct answers', function(done) {
        browser.waitForVisible('.cat_1 .choice_2.correct');
        browser.waitForVisible('.cat_3 .choice_1.correct');
        browser.waitForVisible('.cat_3 .choice_3.correct');
        browser.waitForVisible('.cat_4 .choice_4.correct');
        browser.call(done);
      });

    });

    describe('see solution', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
        browser.submitItem();
        browser.call(done);
      });

      it('displays "show correct answer"', function(done) {
        browser.waitForVisible('.see-answer-panel');
        browser.call(done);
      });

      it('displays correct answers inside the panel', function(done) {
        browser.waitForVisible('.see-answer-panel .panel-heading');
        browser.click('.see-answer-panel .panel-heading');
        browser.waitForVisible('.see-answer-panel .panel-body .cat_1 .choice_2.correct');
        browser.waitForVisible('.see-answer-panel .panel-body .cat_3 .choice_1.correct');
        browser.waitForVisible('.see-answer-panel .panel-body .cat_3 .choice_3.correct');
        browser.waitForVisible('.see-answer-panel .panel-body .cat_4 .choice_4.correct');
        browser.call(done);
      });
    });

    describe('fully correct', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_1');
        browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_3');
        browser.dragAndDropWithOffset('.choices-container .choice_3', '.cat_3');
        browser.dragAndDropWithOffset('.choices-container .choice_4', '.cat_4');
        browser.submitItem();
        browser.call(done);
      });

      it('displays choices as categorized and correct', function(done) {
        browser.waitForVisible('.cat_1 .choice_2.correct');
        browser.waitForVisible('.cat_3 .choice_1.correct');
        browser.waitForVisible('.cat_3 .choice_3.correct');
        browser.waitForVisible('.cat_4 .choice_4.correct');
        browser.call(done);
      });

      it('displays correct feedback', function(done) {
        browser.waitForVisible('.feedback.correct');
        browser.call(done);
      });

    });

    describe('partially correct', function() {
      describe('categorize choice_2 incorrectly as cat_2', function() {
        beforeEach(function(done) {
          browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
          browser.submitItem();
          browser.call(done);
        });

        it('displays choice as categorized and correct', function(done) {
          browser.waitForVisible('.cat_2 .choice_2.incorrect');
          browser.call(done);
        });

        it('displays partial feedback', function(done) {
          browser.waitForVisible('.feedback.incorrect');
          browser.call(done);
        });

        it('displays "show correct answer"', function(done) {
          browser.waitForVisible('.see-answer-panel');
          browser.call(done);
        });
      });

      describe('categorize choice_2 correctly as cat_1', function() {
        beforeEach(function(done) {
          browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_1');
          browser.submitItem();
          browser.call(done);
        });

        it('displays choice as categorized and correct', function(done) {
          browser.waitForVisible('.cat_1 .choice_2.correct');
          browser.call(done);
        });

        it('displays partial feedback', function(done) {
          browser.waitForVisible('.feedback.partial');
          browser.call(done);
        });

        it('displays "show correct answer"', function(done) {
          browser.waitForVisible('.see-answer-panel');
          browser.call(done);
        });
      });

    });

    describe('categorize choice_1 as cat_2', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_2');
        browser.call(done);
      });

      it('displays choice as categorized', function(done) {
        browser.waitForVisible('.cat_2 .choice_1');
        browser.call(done);
      });
    });

    describe('categorize multiple choices as cat_2', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_2');
        browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_2');
        browser.dragAndDropWithOffset('.choices-container .choice_3', '.cat_2');
        browser.dragAndDropWithOffset('.choices-container .choice_4', '.cat_2');
        browser.call(done);
      });

      it('displays choice as categorized', function(done) {
        browser.waitForVisible('.cat_2 .choice_1');
        browser.waitForVisible('.cat_2 .choice_2');
        browser.waitForVisible('.cat_2 .choice_3');
        browser.waitForVisible('.cat_2 .choice_4');
        browser.call(done);
      });
    });

    describe('categorize choice_1 as cat_2 firstly and then change to cat_1', function() {
      beforeEach(function(done) {
        browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_2');
        browser.dragAndDropWithOffset('.cat_2 .choice_1', '.cat_1');
        browser.call(done);
      });

      it('displays choice as categorized', function(done) {
        browser.waitForVisible('.cat_1 .choice_1');
        browser.call(done);
      });
    });

    describe('no answer', function() {
      beforeEach(function(done) {
        browser.submitItem();
        browser.call(done);

      });

      it('displays warning', function(done) {
        browser.waitForVisible('.feedback.warning.answer-expected');
        browser.call(done);
      });
    });
  });
});