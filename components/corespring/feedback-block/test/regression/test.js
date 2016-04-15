/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('feedback-block', function() {

  "use strict";

  var componentName = 'feedback-block';
  var itemJsonFilename = 'one.json';

  function safeTrim(s){
    return (s || '').trim();
  }

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    browser.call(done);
  });

  it('does display correct feedback', function(done) {
    browser.waitAndClick('[value="mc_2"]');
    browser.submitItem();
    browser.waitForVisible('.view-feedback-container');
    var res = browser.getText('.view-feedback-container');
    safeTrim(res).should.equal('Yes, this is correct');
    browser.call(done);
  });

  it('does display incorrect feedback', function(done) {
    browser.waitAndClick('[value="mc_3"]');
    browser.submitItem();
    browser.waitForVisible('.view-feedback-container');
    var res = browser.getText('.view-feedback-container');
    safeTrim(res).should.equal('No, this is not correct');
    browser.call(done);
  });

  it('does display wildcard feedback if no answer', function(done) {
    browser.submitItem();
    browser.waitForVisible('.view-feedback-container');
    var res = browser.getText('.view-feedback-container');
    safeTrim(res).should.equal('No, this is not correct. You did not choose an answer.');
    browser.call(done);
  });


});
