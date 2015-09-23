/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

var inlineChoiceWithId = function(id) {
  return '//div[@id="' + id + '" and @class[contains(., "view-inline-choice")]]';
};

describe('inline-choice', function() {

  "use strict";

  var itemJsonFilename = 'one.json';

  browser.selectInlineChoice = function(id, choice) {
    browser.click(inlineChoiceWithId(id) + '//span[@class[contains(., "dropdown-toggle")]]');
    browser.click(inlineChoiceWithId(id) + '//div[text()="' + choice + '"]');
    return this;
  };

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  beforeEach(function() {
    browser
      .url(browser.options.getUrl('inline-choice', itemJsonFilename))
      .waitFor('.dropdown-menu li', browser.options.defaultTimeout);
  });

  it('feedbacks are positioned correctly', function(done) {
    browser
      .selectInlineChoice("1", "Banana")
      .selectInlineChoice("2", "Apple")
      .submitItem()
      .click(inlineChoiceWithId("1") + '//div')
      .click(inlineChoiceWithId("2") + '//div')
      .getLocation(".player-body", function(err, playerPos) {
        this.getLocation(inlineChoiceWithId("1") + "//div[@class='arrow']", function(err, arrowPos) {
          this.getLocation(inlineChoiceWithId("1") + "//div[@class='popover-content']", function(err, popupPos) {
            arrowPos.x.should.be.above(popupPos.x);
            arrowPos.x.should.be.below(popupPos.x + 200); // popover has a fixed width of 200px

            popupPos.x.should.be.above(playerPos.x);
          });
        });
        this.getLocation(inlineChoiceWithId("2") + "//div[@class='arrow']", function(err, arrowPos) {
          this.getLocation(inlineChoiceWithId("2") + "//div[@class='popover-content']", function(err, popupPos) {
            arrowPos.x.should.be.above(popupPos.x);
            arrowPos.x.should.be.below(popupPos.x + 200); // popover has a fixed width of 200px

            popupPos.x.should.be.above(playerPos.x);
          });
        });
      })
      .call(done);
  });

  describe('multiple correct', function(){
    function assertChoice(choiceLabel, expectedCorrectness){
      return browser
        .selectInlineChoice("1", choiceLabel)
        .submitItem()
        .getAttribute(inlineChoiceWithId('1'), 'class', function(err,res){
          res.split(' ').indexOf(expectedCorrectness).should.be.above(-1);
        });
    }
    it("should accept carrot as correct", function(done){
      assertChoice("Carrot", 'correct').done(done);
    });
    it("should accept lemon as correct", function(done){
      assertChoice("Lemon", 'correct').done(done);
    });
    it("should accept apple as incorrect", function(done){
      assertChoice("Apple", 'incorrect').done(done);
    });
    it("should accept banana as incorrect", function(done){
      assertChoice("Banana", 'incorrect').done(done);
    });
  });

});
