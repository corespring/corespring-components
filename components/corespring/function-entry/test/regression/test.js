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

  browser.enterExpression = function(id, expression) {
    browser.setValue(withId(id) + "//input", expression);
    return this;
  };

  browser.submitItem = function() {
    console.log("submitting");
    this.execute('window.submit()');
    return this;
  };

  beforeEach(function() {
    browser
      .url(browser.options.getUrl('function-entry', itemJsonFilename))
      .waitFor('.view-function-entry', browser.options.defaultTimeout);
  });


  it('correct feedback when correct answer is given', function(done) {
    browser
      .enterExpression("1", "2x+4")
      .submitItem()
      .waitFor("span.correct")
      .call(done);
  });

  it('correct feedback when correct answer is given', function(done) {
    browser
      .enterExpression("1", "y-4=2x")
      .submitItem()
      .waitFor("span.correct")
      .call(done);
  });

  it('incorrect feedback when incorrect answer is given', function(done) {
    browser
      .enterExpression("1", "2x+7")
      .submitItem()
      .waitFor("span.incorrect")
      .call(done);

  });

});
