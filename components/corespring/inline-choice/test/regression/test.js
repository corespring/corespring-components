/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

function inlineChoiceWithId(id) {
  return '//div[@id="' + id + '" and @class[contains(., "view-inline-choice")]]';
};

describe('inline-choice', function() {

  "use strict";

  var itemJsonFilename = 'one.json';

  browser.selectInlineChoice = function(id, choice) {
    this.click(inlineChoiceWithId(id) + '//span[@class[contains(., "dropdown-toggle")]]');
    this.click(inlineChoiceWithId(id) + '//ul[@class[contains(., "dropdown-menu")]]//div[text()="' + choice + '"]');
    return this;
  };

  beforeEach(function(done) {

    browser.getPseudoElementCss = function(selector, pseudo, prop, done) {
      return this.executeAsync(function(selector, pseudo, prop, done) {
        var e = document.querySelector(selector);

        if (!e) {
          throw new Error('not found: ' + selector);
        }
        var s = window.getComputedStyle(e, pseudo);
        var out = s.getPropertyValue(prop);
        done(out);
      }, selector, pseudo, prop).then(function(o) {
        done(null, {
          selector: selector,
          pseudo: pseudo,
          prop: prop,
          value: o.value
        });
      });
    };

    browser.url(browser.getTestUrl('inline-choice', itemJsonFilename));
    browser.waitForExist('.dropdown-menu li');
    browser.call(done);
  });

  it('shows a result icon to the right of the comboboxes', function(done){
    browser.selectInlineChoice("1", "Banana");
    browser.submitItem();
    browser.waitForVisible('.result-icon');
    /*
    browser.getPseudoElementCss('.warning .result-icon', ':after', 'color', function(err, result){
        result.value.should.eql('rgb(153, 153, 153)');
      });
    browser.getPseudoElementCss('.incorrect .result-icon', ':after', 'color', function(err, result){
        result.value.should.eql('rgb(236, 151, 31)');
      });
      */
    browser.call(done);
  });

  it('feedbacks are positioned correctly', function(done) {
    browser.selectInlineChoice("1", "Banana");
    browser.selectInlineChoice("2", "Apple");
    browser.submitItem();
    browser.click(inlineChoiceWithId("1") + '//span');
    browser.click(inlineChoiceWithId("2") + '//span');
    browser.getLocation(".player-body", function(err, playerPos) {
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
    });
    browser.call(done);
  });

  describe('multiple correct', function() {
    function assertChoice(choiceLabel, expectedCorrectness) {
      browser.selectInlineChoice("1", choiceLabel)
      browser.submitItem()
      browser.getAttribute(inlineChoiceWithId('1'), 'class', function(err, res) {
        res.split(' ').indexOf(expectedCorrectness).should.beAbove(-1);
      });
      return browser;
    }
    it("should accept carrot as correct", function(done) {
      assertChoice("Carrot", 'correct');
      browser.call(done);
    });
    it("should accept lemon as correct", function(done) {
      assertChoice("Lemon", 'correct');
      browser.call(done);
    });
    it("should accept apple as incorrect", function(done) {
      assertChoice("Apple", 'incorrect');
      browser.call(done);
    });
    it("should accept banana as incorrect", function(done) {
      assertChoice("Banana", 'incorrect');
      browser.call(done);
    });
  });


});