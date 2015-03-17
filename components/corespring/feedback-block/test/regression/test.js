/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe.only('feedback-block', function() {

  "use strict";

  var itemJsonFilename = 'one.json';
  var itemJson = RegressionHelper.getItemJson('feedback-block', itemJsonFilename);

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  beforeEach(function() {
    browser
      .url(RegressionHelper.getUrl('feedback-block', itemJsonFilename));
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
