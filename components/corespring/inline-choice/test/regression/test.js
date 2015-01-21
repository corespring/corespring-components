/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe.only('inline-choice', function() {

  "use strict";

  var itemJsonFilename = 'one.json';
  var itemJson = RegressionHelper.getItemJson('inline-choice', itemJsonFilename);

  browser.selectInlineChoice = function(choice) {
    console.log("Selecting");
    browser.click('.dropdown-toggle');
    browser.click('//div[text()="' + choice + '"]');
    return this;
  };

  browser.submitItem = function() {
    console.log("submitting");
    this.execute('window.submit()');
    return this;
  };

  beforeEach(function() {
    browser
      .url(RegressionHelper.getUrl('inline-choice', itemJsonFilename))
      .waitFor('.dropdown-menu li', regressionTestRunnerGlobals.defaultTimeout);
  });


  it('displays feedback correctly', function(done) {
    browser
      .selectInlineChoice("Banana")
      .waitFor('.cica')
      .call(done);

  });

});
