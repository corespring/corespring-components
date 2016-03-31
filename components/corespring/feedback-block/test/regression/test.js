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
    browser.options.extendBrowser(browser);

    browser
      .loadTest(componentName, itemJsonFilename)
      .call(done);
  });

  it('does display correct feedback', function(done) {
    browser
      .waitAndClick('[value="mc_2"]')
      .submitItem()
      .waitForVisible('.view-feedback-container')
      .getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('Yes, this is correct');
      })
      .call(done);
  });

  it('does display incorrect feedback', function(done) {
    browser
      .waitAndClick('[value="mc_3"]')
      .submitItem()
      .waitForVisible('.view-feedback-container')
      .getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('No, this is not correct');
      })
      .call(done);
  });

  it('does display wildcard feedback if no answer', function(done) {
    browser
      .submitItem()
      .waitForVisible('.view-feedback-container')
      .getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('No, this is not correct. You did not choose an answer.');
      })
      .call(done);
  });


});
