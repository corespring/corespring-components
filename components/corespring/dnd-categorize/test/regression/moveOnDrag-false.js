/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');
var fs = require('fs');
var _ = require('lodash');

describe('dnd-categorize', function() {

  "use strict";

  var componentName = 'dnd-categorize';
  var itemJsonFilename = 'moveOnDrag-false.json';

  beforeEach(function(done) {
    browser.options.extendBrowser(browser);

    browser
      .loadTest( componentName, itemJsonFilename)
      .call(done);
  });

  describe('in instructor mode', function() {

    beforeEach(function(done) {
      browser
        .setInstructorMode()
        .call(done);

    });

    it('displays correct answers', function(done) {
      browser
        .waitForExist('.cat_1 .choice_2.correct')
        .waitForExist('.cat_3 .choice_1.correct')
        .waitForExist('.cat_3 .choice_3.correct')
        .waitForExist('.cat_4 .choice_2.correct')
        .waitForExist('.cat_4 .choice_4.correct')
        .call(done);
    });

  });

  describe('when wrong answer is submitted', function() {
    beforeEach(function(done) {
      browser
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
        .submitItem()
        .call(done);
    });

    it('displays incorrect feedback', function(done) {
      browser
        .waitForVisible('.feedback.incorrect')
        .call(done);
    });

    it('displays "solution panel"', function(done) {
      browser
        .waitForVisible('.see-answer-panel')
        .call(done);
    });

    it('and clicked on solution-panel, correct answers are displayed', function(done) {
      browser
        .waitAndClick('.see-answer-panel .panel-heading')
        .waitForExist('.see-answer-panel .cat_1 .choice_2.correct')
        .waitForExist('.see-answer-panel .cat_3 .choice_1.correct')
        .waitForExist('.see-answer-panel .cat_3 .choice_3.correct')
        .waitForExist('.see-answer-panel .cat_4 .choice_2.correct')
        .waitForExist('.see-answer-panel .cat_4 .choice_4.correct')
        .call(done);
    });
  });

  describe('when correct answer is submitted', function() {
    beforeEach(function(done) {
      browser
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_1')
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_3')
        .dragAndDropWithOffset('.choices-container .choice_3', '.cat_3')
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_4')
        .dragAndDropWithOffset('.choices-container .choice_4', '.cat_4')
        .submitItem()
        .call(done);
    });

    it('displays choices as categorized and correct', function(done) {
      browser
        .waitForExist('.cat_1 .choice_2.correct')
        .waitForExist('.cat_3 .choice_1.correct')
        .waitForExist('.cat_3 .choice_3.correct')
        .waitForExist('.cat_4 .choice_2.correct')
        .waitForExist('.cat_4 .choice_4.correct')
        .call(done);
    });

    it('displays correct feedback', function(done) {
      browser
        .waitForVisible('.feedback.correct')
        .call(done);
    });

  });

  describe('when partially correct answer is submitted', function() {

    beforeEach(function(done) {
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

    it('displays "solution panel"', function(done) {
      browser
        .waitForVisible('.see-answer-panel')
        .call(done);
    });

  });

  describe('when multiple choices are dropped on category', function() {
    beforeEach(function(done) {
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_2')
        .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
        .dragAndDropWithOffset('.choices-container .choice_3', '.cat_2')
        .call(done);
    });

    it('displays choice as categorized', function(done) {
      browser
        .waitForVisible('.cat_2 .choice_1')
        .waitForVisible('.cat_2 .choice_2')
        .waitForVisible('.cat_2 .choice_3')
        .call(done);
    });
  });

  describe('when choice is dragged from category and dropped on other category', function() {
    beforeEach(function(done) {
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

  describe('when submitted without answer', function() {
    beforeEach(function(done) {
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

  describe('when choices are set to moveOnDrag=false', function(){

    it('allows to drop the same choice multiple times on the same category', function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
        .waitForExist('.cat_1 .choice_1')
        .elements('.cat_1 .choice_1', function(err,res){
          expect(res.value.length).toBe(3);
        })
        .call(done);
    });
    it('allows to drop the same choice multiple times on different categories', function(done){
      browser
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_2')
        .dragAndDropWithOffset('.choices-container .choice_1', '.cat_3')
        .waitForExist('.cat_1 .choice_1')
        .waitForExist('.cat_2 .choice_1')
        .waitForExist('.cat_3 .choice_1')
        .call(done);
    });
  });

  describe('clicking undo', function(){
    describe("when two choices have been placed", function(){

      beforeEach(function(done){
        browser
          .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
          .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
          .waitAndClick('.btn-undo')
          .call(done);
      });

      it('should remove the second choice and leave the first one', function(done){
        var invertWait;
        browser
          .waitForExist('.cat_2 .choice_2', 2000, invertWait=true)
          .waitForExist('.cat_1 .choice_1')
          .call(done);
      });

      it('should show the undo/startOver buttons as enabled', function(done){
        var invertWait;
        browser
          .waitForExist('.btn-undo.disabled', 2000, invertWait=true)
          .waitForExist('.btn-start-over.disabled', 2000, invertWait=true)
          .call(done);
      });

    });

    describe("when one choice has been placed", function(){

      beforeEach(function(done){
        browser
          .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
          .waitAndClick('.btn-undo')
          .call(done);
      });

      it('should remove the choice', function(done){
        var invertWait;
        browser
          .waitForExist('.cat_1 .choice_1', 2000, invertWait=true)
          .call(done);
      });

      it('should show the undo/startOver buttons as disabled', function(done){
        var invertWait;
        browser
          .waitForExist('.btn-undo.disabled')
          .waitForExist('.btn-start-over.disabled')
          .call(done);
      });

    });

  });

  describe('clicking startOver', function(){

    describe('when two choices have been placed', function(){
      beforeEach(function(done){
        browser
          .dragAndDropWithOffset('.choices-container .choice_1', '.cat_1')
          .dragAndDropWithOffset('.choices-container .choice_2', '.cat_2')
          .waitAndClick('.btn-start-over')
          .call(done);
      });

      it('should remove both choices from the categories', function(done){
        var invertWait;
        browser
          .waitForExist('.cat_1 .choice_1', 2000, invertWait=true)
          .waitForExist('.cat_2 .choice_2', 2000, invertWait=true)
          .call(done);
      });

      it('should show the undo/startOver buttons as disabled', function(done){
        var invertWait;
        browser
          .waitForExist('.btn-undo.disabled')
          .waitForExist('.btn-start-over.disabled')
          .call(done);
      });
    });

  });


});