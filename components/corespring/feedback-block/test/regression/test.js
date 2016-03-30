/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('feedback-block', function() {

  "use strict";

  var itemJsonFilename = 'one.json';

  beforeEach(function(done) {
    
    browser.submitItem = function() {
      this.pause(500);
      this.execute('window.submit()');
      this.pause(500);
      return this;
    };
    
    browser
      .url(browser.options.getUrl('feedback-block', itemJsonFilename))
      .waitForExist('.player-rendered')
      .pause(1000)
      .call(done);
  });

  function safeTrim(s){
    return (s || '').trim();
  }


  it('does display correct feedback', function(done) {
    browser
      .click('[value="mc_2"]')
      .submitItem()
      .waitForExist('.view-feedback-container')
      .getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('Yes, this is correct');
      })
      .call(done);
  });

  it('does display incorrect feedback', function(done) {
    browser
      .click('[value="mc_3"]')
      .submitItem()
      .waitForExist('.view-feedback-container')
      .getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('No, this is not correct');
      })
      .call(done);
  });

  it('does display wildcard feedback if no answer', function(done) {
    browser
      .submitItem()
      .waitForExist('.view-feedback-container')
      .getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('No, this is not correct. You did not choose an answer.');
      })
      .call(done);
  });


});
