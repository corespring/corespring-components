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
    browser.loadTest(componentName, itemJsonFilename);
    browser.call(done);
  });

  describe('instructor mode', function() {

    beforeEach(function(done) {
      browser.setInstructorMode();
      browser.call(done);

    });

    it('displays correct answer [] (dndi-01)', function(done) {
      browser.waitForVisible(selectedChoice("c_2"));
      browser.call(done);
    });

    it('does not display see-solution (dndi-02)', function(done) {
      var waitForHidden;
      browser.waitForVisible('.see-solution', 2000, waitForHidden = true);
      browser.call(done);
    });

    it('displays all choices as disabled (dndi-03)', function(done) {
      browser.waitForVisible(choice('c_1') + '.ui-draggable-disabled');
      browser.waitForVisible(choice('c_2') + '.ui-draggable-disabled');
      browser.waitForVisible(choice('c_3') + '.ui-draggable-disabled');
      browser.waitForVisible(choice('c_4') + '.ui-draggable-disabled');
      browser.call(done);
    });

  });

  it('correct answer results in correct feedback (dndi-04)', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback.correct');
    browser.call(done);
  });

  it('superfluous answer results in partial feedback (dndi-05)', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback');
    browser.getAttribute('.feedback', 'class', function(err, res) {
      expect(res).toContain('partial');
    });
    browser.call(done);
  });

  it('incorrect answer results in incorrect feedback (dndi-06)', function(done) {
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback.incorrect');
    browser.call(done);
  });

  it('incorrect answer is marked as incorrect (dndi-07)', function(done) {
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.incorrect');
    browser.call(done);
  });

  it('correct answer is marked as correct (dndi-08)', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.correct');
    browser.call(done);
  });

  it('correct answer in wrong position is marked as incorrect (dndi-09)', function(done) {
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.incorrect');
    browser.call(done);
  });

  it('superfluous answer is marked as incorrect (dndi-10)', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.incorrect');
    browser.call(done);
  });

  it('selected choices are marked correctly (dndi-11)', function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.selected-choice.correct .fa-check-circle');
    browser.waitForVisible('.selected-choice.incorrect .fa-times-circle');
    browser.call(done);
  });

  it('shows warning when no item is selected (dndi-12)', function(done) {
    browser.submitItem();
    browser.waitForVisible('.empty-answer-area-warning');
    browser.waitForText('.feedback.warning');
    browser.getText('.feedback.warning', function(err, res) {
      expect(res).toEqual('You did not enter a response.');
    });
    browser.call(done);
  });

  it("removes choice when moveOnDrag is true and choice has been placed (dndi-13)", function(done) {
    browser.waitForVisible(choice('c_4'));
    browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
    browser.waitForExist(choice('c_4') + ".placed");
    browser.call(done);
  });

  describe('correct answer area (dndi-14)', function() {
    it("is shown, if answer is incorrect", function(done) {
      browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
      browser.submitItem();
      browser.waitForVisible('.see-solution');
      browser.call(done);
    });

    it("is hidden, if answer is correct (dndi-15)", function(done) {
      browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
      browser.submitItem();
      browser.waitForExist('.see-solution');
      browser.isVisible('.see-solution', function(err, res) {
        expect(res).toBe(false);
      });
      browser.call(done);
    });

    it("renders correct answer if answer is incorrect (dndi-16)", function(done) {
      browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
      browser.submitItem();
      browser.waitAndClick('.see-solution .panel-heading');
      browser.waitForExist('.correct-answer-area-holder .answer-area-inline');
      browser.waitForVisible(selectedChoice('c_2'));
      browser.call(done);
    });
  });

  describe("math", function() {
    it("renders math in choice (dndi-17)", function(done) {
      browser.waitForExist(choice('c_4') + ' .MathJax_Preview');
      browser.call(done);
    });
    it("renders math in answer area text (dndi-18)", function(done) {
      browser.waitForExist('.answer-area-holder .MathJax_Preview');
      browser.call(done);
    });
    it("renders math in selected choice (dndi-19)", function(done) {
      browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
      browser.waitForExist('.answer-area-holder .selected-choice .MathJax_Preview');
      browser.call(done);
    });
    it("renders math in correct answer area (dndi-20)", function(done) {
      browser.dragAndDropWithOffset(choice('c_4'), landingPlace('aa_1'));
      browser.submitItem();
      browser.waitAndClick('h4.panel-title');
      browser.waitForExist('.correct-answer-area-holder .MathJax_Preview');
      browser.call(done);
    });

  });

  it("allows drag and drop inside one answer area (dndi-21)", function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback.correct');
    browser.call(done);
  });

  it("allows drag and drop between answer areas (dndi-22)", function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_2'));
    browser.dragAndDropWithOffset(selectedChoice('c_2'), landingPlace('aa_1'));
    browser.submitItem();
    browser.waitForVisible('.feedback.correct');
    browser.call(done);
  });

  it("allows removing a choice by dragging it out of answer area (dndi-23)", function(done) {
    browser.dragAndDropWithOffset(choice('c_2'), landingPlace('aa_1'));
    browser.moveToObject(selectedChoice('c_2'), 2, 2);
    browser.buttonDown();
    browser.moveTo(null, 0, 200);
    browser.buttonUp();
    browser.waitForRemoval(selectedChoice('c_2'));
    browser.call(done);
  });

  it('should keep the position of choices, when one is dragged away (dndi-24)', function(done) {

    function getLocations(){
      browser.waitForVisible('.choices-holder');
      var containerLocation = browser.getLocation('.choices-holder');
      var locations = {};
      for(var i = 1; i <= 4; i++){
        var id = choice('c_' + i);
        browser.waitForExist(id); //the dragged choice is not visible, but still there after the drag
        locations[id] = browser.getLocation(id);
        locations[id].id = id;
        locations[id].x -= containerLocation.x;
        locations[id].y -= containerLocation.y;
      }
      return locations;
    }

    var locations = getLocations();
    browser.dragAndDropWithOffset(choice('c_1'), landingPlace('aa_2'));
    var newLocations = getLocations();
    expect(newLocations).toEqual(locations);
    browser.call(done);
  });

});