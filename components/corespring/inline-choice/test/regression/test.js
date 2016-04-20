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

  function selectInlineChoice(id, choice) {
    var toggle = inlineChoiceWithId(id) + '//span[@class[contains(., "dropdown-toggle")]]';
    var dropDownMenu = inlineChoiceWithId(id) + '//ul[@class[contains(., "dropdown-menu")]]';
    var option = dropDownMenu + '//div[text()="' + choice + '"]';

    browser.click(toggle);
    browser.click(option);
  }

  function waitAndGetLocation(selector) {
    browser.waitForExist(selector);
    return browser.getLocation(selector);
  }

  function getPseudoElementCss(selector, pseudo, prop) {
    var out = browser.execute(function(selector, pseudo, prop) {
      var e = document.querySelector(selector);

      if (!e) {
        throw new Error('not found: ' + selector);
      }
      var s = window.getComputedStyle(e, pseudo);
      var out = s.getPropertyValue(prop);
      return out;
    }, selector, pseudo, prop);

    return {
      selector: selector,
      pseudo: pseudo,
      prop: prop,
      value: out.value
    };
  }

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    browser.call(done);
  });

  it('shows a result icon to the right of the comboboxes', function(done) {
    selectInlineChoice("1", "Banana");
    browser.submitItem();
    browser.waitForExist('.result-icon');
    getPseudoElementCss('.warning .result-icon', ':after', 'color').value.should.equal('rgb(153, 153, 153)');
    getPseudoElementCss('.incorrect .result-icon', ':after', 'color').value.should.equal('rgb(236, 151, 31)');
    browser.call(done);
  });


  it('feedbacks are positioned correctly', function(done) {
    var playerPos, arrowPos1, arrowPos2, popupPos;

    selectInlineChoice("1", "Banana");
    selectInlineChoice("2", "Apple");

    browser.submitItem();
    browser.waitAndClick(inlineChoiceWithId("1") + '//span');
    browser.waitAndClick(inlineChoiceWithId("2") + '//span');

    playerPos = waitAndGetLocation(".player-body");
    arrowPos1 = waitAndGetLocation(inlineChoiceWithId("1") + "//div[@class='arrow']");
    popupPos = waitAndGetLocation(inlineChoiceWithId("1") + "//div[@class='popover-content']");

    arrowPos1.x.should.be.above(popupPos.x);
    arrowPos1.x.should.be.below(popupPos.x + 200); // popover has a fixed width of 200px
    popupPos.x.should.be.above(playerPos.x);

    arrowPos2 = waitAndGetLocation(inlineChoiceWithId("2") + "//div[@class='arrow']");
    popupPos = waitAndGetLocation(inlineChoiceWithId("2") + "//div[@class='popover-content']");

    arrowPos2.x.should.be.above(popupPos.x);
    arrowPos2.x.should.be.below(popupPos.x + 200); // popover has a fixed width of 200px
    popupPos.x.should.be.above(playerPos.x);

    browser.call(done);
  });

  describe('multiple correct', function() {
    function assertChoice(choiceLabel, expectedCorrectness) {
      selectInlineChoice("1", choiceLabel);
      browser.submitItem();
      browser.getAttribute(inlineChoiceWithId('1'), 'class', function(err, res) {
        res.split(' ').indexOf(expectedCorrectness).should.be.above(-1);
      });
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