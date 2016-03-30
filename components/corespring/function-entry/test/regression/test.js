/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('evaluate expression', function() {

  "use strict";

  var itemJsonFilename = 'one.json';

  var withId = function(id) {
    return '//div[@id="' + id + '" and @class[contains(., "view-function-entry")]]';
  };

  beforeEach(function(done) {
    browser.enterExpression = function(id, expression) {
      this.pause(500);
      this.waitForExist(withId(id));
      this.waitForExist(withId(id) + "//input");
      this.setValue(withId(id) + "//input", expression);
      this.pause(500);
      return this;
    };

    browser.submitItem = function() {
      console.log("submitting");
      this.pause(500);
      this.execute('window.submit()');
      this.pause(500);
      return this;
    };

    browser
      .url(browser.options.getUrl('function-entry', itemJsonFilename))
      .waitForExist('.player-rendered')
      .call(done);
  });


  it('correct feedback when correct answer is given', function(done) {
    browser
      .enterExpression("1", "2x+4")
      .submitItem()
      .waitForExist("span.correct")
      .call(done);
  });

  it('correct feedback when correct answer is given', function(done) {
    browser
      .enterExpression("1", "y-4=2x")
      .submitItem()
      .waitForExist("span.correct")
      .call(done);
  });

  it('incorrect feedback when incorrect answer is given', function(done) {
    browser
      .enterExpression("1", "2x+7")
      .submitItem()
      .waitForExist("span.incorrect")
      .call(done);

  });

});
