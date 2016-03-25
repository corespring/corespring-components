/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

describe('inplace ordering', function() {

  var itemJsonFilename = 'inplace.json';

  var divContaining = function(s) {
    return "//div[text()[contains(., '" + s + "')]]";
  };

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  browser.resetItem = function() {
    this.execute('window.reset()');
    return this;
  };

  beforeEach(function(done) {
    browser.url(browser.getTestUrl('ordering', itemJsonFilename));
    browser.waitForVisible('.choice');
    browser.call(done);
  });

  describe('correctness', function() {

    it('submitting without interaction results in warning feedback', function(done) {
      browser.submitItem();
      browser.waitForVisible('.feedback.warning');
      browser.call(done);
    });

    it('MathJax Renders', function(done) {
      browser.waitForExist('.choice .MathJax_Preview');
      browser.call(done);
    });

    it('MathJax Renders after Reset', function(done) {
      browser.submitItem();
      browser.resetItem();
      browser.waitForExist('.choice .MathJax_Preview');
      browser.call(done);
    });

  });


});
