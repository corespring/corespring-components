/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('blueprint', function() {

  "use strict";

  var itemJsonFilename = 'first-render-regression-test.json';
  var itemJson = browser.getItemJson('blueprint', itemJsonFilename);


  beforeEach(function(done) {
    browser.url(browser.getTestUrl('blueprint', itemJsonFilename));
    browser.call(done);;
  });

  describe('feedback', function(){
    it('should show feedback', function(){

    });
  });

});