/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

describe('feedback-block', function() {

  "use strict";

  var itemJsonFilename = 'one.json';

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  beforeEach(function() {
    browser
      .timeouts('implicit', browser.options.defaultTimeout)
      .url(browser.options.getUrl('feedback-block', itemJsonFilename));
  });

  function safeTrim(s){
    return (s || '').trim();
  }


  it('does display correct feedback', function(done) {
    browser
      .click('[value="mc_2"]')
      .submitItem()
      .getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('Yes, this is correct');
      })
      .call(done);
  });

  it('does display incorrect feedback', function(done) {
    browser
      .click('[value="mc_3"]')
      .submitItem()
      .getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('No, this is not correct');
      })
      .call(done);
  });

  it('does display wildcard feedback if no answer', function(done) {
    browser
      .submitItem()
      .getText('.view-feedback-container', function(err,res){
        safeTrim(res).should.equal('No, this is not correct. You did not choose an answer.');
      })
      .call(done);
  });


});
