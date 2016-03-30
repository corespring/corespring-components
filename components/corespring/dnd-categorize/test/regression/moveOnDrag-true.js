/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('dnd-categorize moveOnDrag true', function() {

  "use strict";

  var itemJsonFilename = 'moveOnDrag-true.json';
  var itemJson = browser.options.getItemJson('dnd-categorize', itemJsonFilename);

  console.log("dnd-categorize moveOnDrag.true");

  beforeEach(function(done) {
    browser.dragAndDropWithOffset = function(fromSelector, toSelector){
      return this.moveToObject(fromSelector, 20, 4)
        .buttonDown(0)
        .pause(500)
        .moveToObject(toSelector, 20, 10)
        .pause(500)
        .buttonUp()
        .pause(500);
    };

    browser.submitItem = function() {
      console.log("submitting");
      this.execute('window.submit()');
      return this;
    };

    browser.setInstructorMode = function() {
      console.log("setInstructorMode");
      this.execute('window.setMode("instructor")');
      return this;
    };

    browser
      .url(browser.options.getUrl('dnd-categorize', itemJsonFilename))
      .waitForExist('.player-rendered')
      .call(done);
  });

  describe('undo', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
        .click('.btn-undo')
        .pause(500)
        .call(done);
    });

    it('should render the choice_2 as visible in the choices container', function(done){
      browser
        .waitForVisible('.choices-container .choice_2')
        .call(done);
    });

    it('should render the choice_1 as placed in the choices container', function(done){
      browser
        .waitFor('.choices-container .choice_1.placed')
        .call(done);
    });

  });

  describe('startOver', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
        .click('.btn-start-over')
        .pause(500)
        .call(done);
    });

    it('should render both choices as visible in the choices container', function(done){
      browser
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
        .waitFor('.choices-container .choice_2.placed')
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

  describe('instructor mode', function(){

    beforeEach(function(done){
      browser
        .setInstructorMode()
        .call(done);

    });

    it('displays correct answers', function(done) {
      browser
        .waitForExist('.cat_1 .choice_2.correct')
        .waitForExist('.cat_3 .choice_1.correct')
        .waitForExist('.cat_3 .choice_3.correct')
        .waitForExist('.cat_4 .choice_4.correct')
        .call(done);
    });

  });

  describe('see solution', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
        .submitItem()
        .call(done);
    });

    it('displays "show correct answer"', function(done) {
      browser
        .waitForVisible('.see-answer-panel')
        .call(done);
    });

    it('displays correct answers inside the panel', function(done) {
      browser
        .waitForVisible('.see-answer-panel .panel-heading')
        .click('.see-answer-panel .panel-heading')
        .pause(500)
        .waitForExist('.see-answer-panel .cat_1 .choice_2.correct')
        .waitForExist('.see-answer-panel .cat_3 .choice_1.correct')
        .waitForExist('.see-answer-panel .cat_3 .choice_3.correct')
        .waitForExist('.see-answer-panel .cat_4 .choice_4.correct')
        .call(done);
    });
  });

  describe('fully correct', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_1')
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_3')
        .dragAndDropWithOffset('.choices-container .choice_3', '.cat_3')
        .dragAndDropWithOffset('.choices-container .choice_4', '.cat_4')
        .submitItem()
        .call(done);
    });

    it('displays choices as categorized and correct', function(done) {
      browser
        .waitForExist('.cat_1 .choice_2.correct')
        .waitForExist('.cat_3 .choice_1.correct')
        .waitForExist('.cat_3 .choice_3.correct')
        .waitForExist('.cat_4 .choice_4.correct')
        .call(done);
    });

    it('displays correct feedback', function(done) {
      browser
        .waitForVisible('.feedback.correct')
        .call(done);
    });

  });

  describe('partially correct', function(){

    describe('categorize choice_2 incorrectly as cat_2', function(){
      beforeEach(function(done){
        browser
          .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
          .submitItem()
          .call(done);
      });

      it('displays choice as categorized and correct', function(done) {
        browser
          .waitForExist('.cat_2 .choice_2.incorrect')
          .call(done);
      });

      it('displays partial feedback', function(done) {
        browser
          .waitForVisible('.feedback.incorrect')
          .call(done);
      });

      it('displays "show correct answer"', function(done) {
        browser
          .waitForVisible('.see-answer-panel')
          .call(done);
      });
    });

    describe('categorize choice_2 correctly as cat_1', function(){
      beforeEach(function(done){
        browser
          .dragAndDropWithOffset('.choices-container .choice_2', '.cat_1')
          .submitItem()
          .call(done);
      });

      it('displays choice as categorized and correct', function(done) {
        browser
          .waitForExist('.cat_1 .choice_2.correct')
          .call(done);
      });

      it('displays partial feedback', function(done) {
        browser
          .waitForVisible('.feedback.partial')
          .call(done);
      });

      it('displays "show correct answer"', function(done) {
        browser
          .waitForVisible('.see-answer-panel')
          .call(done);
      });
    });

  });

  describe('categorize choice_1 as cat_2', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_2')
        .call(done);
    });

    it('displays choice as categorized', function(done) {
      browser
        .waitForVisible('.cat_2 .choice_1')
        .call(done);
    });
  });

  describe('categorize multiple choices as cat_2', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_2')
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
        .dragAndDropWithOffset('.choices-container .choice_3', '.cat_2')
        .dragAndDropWithOffset('.choices-container .choice_4', '.cat_2')
        .call(done);
    });

    it('displays choice as categorized', function(done) {
      browser
        .waitForVisible('.cat_2 .choice_1')
        .waitForVisible('.cat_2 .choice_2')
        .waitForVisible('.cat_2 .choice_3')
        .waitForVisible('.cat_2 .choice_4')
        .call(done);
    });
  });

  describe('categorize choice_1 as cat_2 firstly and then change to cat_1', function(){
    beforeEach(function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_2')
        .dragAndDropWithOffset('.cat_2 .choice_1', '.cat_1')
        .call(done);
    });

    it('displays choice as categorized', function(done) {
      browser
        .waitForVisible('.cat_1 .choice_1')
        .call(done);
    });
  });

  describe('no answer', function(){
    beforeEach(function(done){
      browser
        .submitItem()
        .call(done);

    });

    it('displays warning', function(done) {
      browser
        .waitForVisible('.feedback.warning.answer-expected')
        .call(done);
    });
  });


});
