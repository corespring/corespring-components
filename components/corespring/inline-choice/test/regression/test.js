/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

function inlineChoiceWithId(id) {
  return '//div[@id="' + id + '" and @class[contains(., "view-inline-choice")]]';
};

describe('inline-choice', function() {

  "use strict";

  var componentName = 'inline-choice';
  var itemJsonFilename = 'one.json';

  /* TODO Doesn't work at the moment - is the drop down fully visible? need to check with a browser
  beforeEach(function(done) {

    browser.selectInlineChoice = function(id, choice) {
      var toggle = inlineChoiceWithId(id) + '//span[@class[contains(., "dropdown-toggle")]]';
      var dropDownMenu = inlineChoiceWithId(id) + '//ul[@class[contains(., "dropdown-menu")]]';
      var option = dropDownMenu + '//div[text()="' + choice + '"]';

      browser.waitForVisible(toggle);
      browser.click(toggle);
      browser.waitForVisible(option);
      browser.click(option);
      return browser;
    };

    browser.addCommand("getPseudoElementCss", function(selector, pseudo, prop) {
      browser.executeAsync(function(selector, pseudo, prop, done) {
        var e = document.querySelector(selector);

        if (!e) {
          throw new Error('not found: ' + selector);
        }
        var s = window.getComputedStyle(e, pseudo);
        var out = s.getPropertyValue(prop);
        done(out);
      }, selector, pseudo, prop)
        .then(
          function(o) {
        done(null, {
          selector: selector,
          pseudo: pseudo,
          prop: prop,
          value: o.value
        });
      });
    });

    browser.waitAndGetLocation = function(selector, cb) {
      browser.waitForExist(selector);
      browser.getLocation(selector, cb);
    };

    browser.loadTest(componentName, itemJsonFilename);
    browser.call(done);
  });

  it('shows a result icon to the right of the comboboxes', function(done) {
    browser.selectInlineChoice("1", "Banana");
    browser.submitItem();
    browser.waitForExist('.result-icon');
    browser.getPseudoElementCss('.warning .result-icon', ':after', 'color', function(err, result) {
      result.value.should.equal('rgb(153, 153, 153)');
    });
    browser.getPseudoElementCss('.incorrect .result-icon', ':after', 'color', function(err, result) {
      result.value.should.equal('rgb(236, 151, 31)');
    });
    browser.call(done);
  });

  it('feedbacks are positioned correctly', function(done) {
    var playerPos, arrowPos1, arrowPos2;

    browser.selectInlineChoice("1", "Banana");
    browser.selectInlineChoice("2", "Apple");
    browser.submitItem();
    browser.waitAndClick(inlineChoiceWithId("1") + '//span');
    browser.waitAndClick(inlineChoiceWithId("2") + '//span');
    browser.waitAndGetLocation(".player-body", function(err, pos) {
      playerPos = pos;
    });
    browser.waitAndGetLocation(inlineChoiceWithId("1") + "//div[@class='arrow']", function(err, pos) {
      arrowPos1 = pos;
    });
    browser.waitAndGetLocation(inlineChoiceWithId("1") + "//div[@class='popover-content']", function(err, popupPos) {
      arrowPos1.x.should.be.above(popupPos.x);
      arrowPos1.x.should.be.below(popupPos.x + 200); // popover has a fixed width of 200px
      popupPos.x.should.be.above(playerPos.x);
    });
    browser.waitAndGetLocation(inlineChoiceWithId("2") + "//div[@class='arrow']", function(err, pos) {
      arrowPos2 = pos;
    });
    browser.waitAndGetLocation(inlineChoiceWithId("2") + "//div[@class='popover-content']", function(err, popupPos) {
      arrowPos2.x.should.be.above(popupPos.x);
      arrowPos2.x.should.be.below(popupPos.x + 200); // popover has a fixed width of 200px
      popupPos.x.should.be.above(playerPos.x);
    });
    browser.call(done);
  });

  describe('multiple correct', function() {
    function assertChoice(choiceLabel, expectedCorrectness) {
      browser.selectInlineChoice("1", choiceLabel);
      browser.submitItem();
      browser.getAttribute(inlineChoiceWithId('1'), 'class', function(err, res) {
        res.split(' ').indexOf(expectedCorrectness).should.be.above(-1);
      });
    }
    it("should accept carrot as correct", function(done) {
      assertChoice("Carrot", 'correct').done(done);
    });
    it("should accept lemon as correct", function(done) {
      assertChoice("Lemon", 'correct').done(done);
    });
    it("should accept apple as incorrect", function(done) {
      assertChoice("Apple", 'incorrect').done(done);
    });
    it("should accept banana as incorrect", function(done) {
      assertChoice("Banana", 'incorrect').done(done);
    });
  });

  */

});