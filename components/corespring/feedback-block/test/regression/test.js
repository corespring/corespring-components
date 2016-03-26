/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('feedback-block', function() {

  "use strict";

  var itemJsonFilename = 'one.json';

  beforeEach(function(done) {
    browser.url(browser.getTestUrl('feedback-block', itemJsonFilename));
    browser.waitForVisible('[value="mc_1"]');
    browser.waitForVisible('[value="mc_2"]');
    browser.waitForVisible('[value="mc_3"]'),
    browser.waitFor('[value="mc_4"]');
    browser.call(done);
  });

  function safeTrim(s){
    return (s || '').trim();
  }

  it('does display correct feedback', function(done) {
    browser.click('[value="mc_2"]');
    browser.submitItem();
    browser.waitForText('.view-feedback-container');
    browser.getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('Yes, this is correct');
      });
    browser.call(done);
  });

  it('does display incorrect feedback', function(done) {
    browser.click('[value="mc_3"]');
    browser.submitItem();
    browser.waitForText('.view-feedback-container');
    browser.getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('No, this is not correct');
      });
    browser.call(done);
  });

  it('does display wildcard feedback if no answer', function(done) {
    browser.submitItem();
    browser.waitForText('.view-feedback-container');
    browser.getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('No, this is not correct. You did not choose an answer.');
      });
    browser.call(done);
  });


});
