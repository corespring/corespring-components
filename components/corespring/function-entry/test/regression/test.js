/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('evaluate expression', function() {

  "use strict";

  var componentName = 'function-entry';
  var itemJsonFilename = 'one.json';

  var withId = function(id) {
    return '//div[@id="' + id + '" and @class[contains(., "view-function-entry")]]';
  };

  function enterExpression(id, expression) {
    browser.setValue(withId(id) + "//input", expression);
  }

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    browser.call(done);
  });

  it('correct feedback when correct answer is given', function(done) {
    enterExpression("1", "2x+4");
    browser.submitItem();
    browser.waitForVisible("span.correct");
    browser.call(done);
  });

  it('correct feedback when correct answer is given', function(done) {
    enterExpression("1", "y-4=2x");
    browser.submitItem();
    browser.waitForVisible("span.correct");
    browser.call(done);
  });

  it('incorrect feedback when incorrect answer is given', function(done) {
    enterExpression("1", "2x+7");
    browser.submitItem();
    browser.waitForVisible("span.incorrect");
    browser.call(done);
  });

});