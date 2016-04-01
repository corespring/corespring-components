/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('dnd-categorize when moveOnDrag = true', function() {

  "use strict";

  var componentName = 'dnd-categorize';
  var itemJsonFilename = 'moveOnDrag-true.json';

  beforeEach(function(done) {
    browser.options.extendBrowser(browser);

    browser
      .loadTest(componentName, itemJsonFilename)
      .call(done);
  });

  describe('clicking undo', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
        .waitAndClick('.btn-undo')
        .call(done);
    });

    it('remove the choice from the category and makes it available again', function(done){
      var invertWait;
      browser
        .waitForExist('.cat_1 .choice_1', 2000, invertWait=true)
        .waitForVisible('.choices-container .choice_1')
        .call(done);
    });
  });

  describe('clicking startOver', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_1')
        .waitAndClick('.btn-start-over')
        .call(done);
    });

    it('remove the choices from the category and makes them available again', function(done){
      var invertWait;
      browser
        .waitForExist('.cat_1 .choice_1', 2000, invertWait=true)
        .waitForExist('.cat_1 .choice_2', 2000, invertWait=true)
        .waitForVisible('.choices-container .choice_1')
        .waitForVisible('.choices-container .choice_2')
        .call(done);
    });
  });

  describe('move choice to category', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
        .call(done);
    });

    it('should render the empty space as placed', function(done){
      browser
        .waitForExist('.choices-container .choice_2.placed')
        .call(done);
    });

    it('should render the choice as categorized', function(done){
      browser
        .waitForVisible('.cat_2 .choice_2')
        .call(done);
    });

  });

  describe('move choice back to choices', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
        .dragAndDropWithOffset('.cat_2 .choice_2', '.choices-container')
        .call(done);
    });

    it('should render the choice as visible', function(done){
      browser
        .waitForVisible('.choices-container .choice_2')
        .call(done);
    });

  });

});
