/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

describe('inplace ordering (inpor)', function() {

  var componentName = 'ordering';
  var itemJsonFilename = 'inplace.json';

  var divContaining = function(s) {
    return "//div[text()[contains(., '" + s + "')]]";
  };

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    browser.call(done);
  });


  it('submitting without interaction results in warning feedback (inpor-01)', function(done) {
    browser.submitItem();
    browser.waitForVisible('.feedback.warning');
    browser.call(done);
  });

  it('MathJax Renders (inpor-02)', function(done) {
    browser.waitForExist('.choice .MathJax_Preview');
    browser.getHTML(divContaining('Third')).should.match(/MathJax_Preview/);
    browser.call(done);
  });

  it('MathJax Renders after Reset (inpor-03)', function(done) {
    browser.submitItem();
    browser.resetItem();
    browser.pause(500);
    browser.waitForExist('.choice .MathJax_Preview');
    browser.getHTML(divContaining('Third')).should.match(/MathJax_Preview/);
    browser.call(done);
  });
});