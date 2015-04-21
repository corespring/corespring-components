/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('blueprint', function() {

  "use strict";

  var itemJsonFilename = 'first-render-regression-test.json';
  var itemJson = RegressionHelper.getItemJson('blueprint', itemJsonFilename);


  beforeEach(function(done) {

    browser.submitItem = function() {
      this.execute('window.submit()');
      return this;
    };

    browser.waitForWithTimeout = function(selector){
      return browser.waitFor(selector, regressionTestRunnerGlobals.defaultTimeout);
    };

    browser
      .timeouts('implicit', regressionTestRunnerGlobals.defaultTimeout)
      .url(RegressionHelper.getUrl('match', itemJsonFilename))
      .call(done);
  });

  describe('feedback', function(){
    it('should show feedback', function(){

    });
  });

});