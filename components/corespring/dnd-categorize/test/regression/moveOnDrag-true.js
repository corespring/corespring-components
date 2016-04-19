/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('dnd-categorize when moveOnDrag = true (dndct)', function() {

  "use strict";

  var componentName = 'dnd-categorize';
  var itemJsonFilename = 'moveOnDrag-true.json';

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    expect(browser.getTitle()).toBe('rig');
    browser.call(done);
  });

  describe('clicking undo', function() {
    beforeEach(function(done) {
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
      browser.waitAndClick('.btn-undo');
      browser.call(done);
    });

    it('remove the choice from the category and makes it available again (dndct-01)', function(done) {
      browser.waitForRemoval('.cat_1 .choice_1');
      browser.waitForVisible('.choices-container .choice_1');
      browser.call(done);
    });
  });

  describe('clicking startOver', function() {
    beforeEach(function(done) {
      browser.dragAndDropWithOffset('.choices-container .choice_1', '.cat_1');
      browser.dragAndDropWithOffset('.choices-container .choice_2', '.cat_1');
      browser.waitAndClick('.btn-start-over');
      browser.call(done);
    });

    it('remove the choices from the category and makes them available again (dndct-02)', function(done) {
      browser.waitForRemoval('.cat_1 .choice_1');
      browser.waitForRemoval('.cat_1 .choice_2');
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

    it('should render the empty space as placed (dndct-03)', function(done) {
      browser.waitForVisible('.choices-container .choice_2.placed');
      browser.call(done);
    });

    it('should render the choice as categorized (dndct-04)', function(done) {
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

    it('should render the choice as visible (dndct-04)', function(done) {
      browser.waitForVisible('.choices-container .choice_2');
      browser.call(done);
    });

  });

});