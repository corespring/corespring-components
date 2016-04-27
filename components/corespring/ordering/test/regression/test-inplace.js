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
    browser.options.extendBrowser(browser);

    browser
      .loadTest(componentName, itemJsonFilename)
      .call(done);
  });
  

  it('submitting without interaction results in warning feedback (inpor-01)', function(done) {
    browser
      .submitItem()
      .waitFor('.feedback.warning')
      .call(done);
  });

  it('MathJax Renders (inpor-02)', function(done) {
    browser
      .waitForVisible('.choice .MathJax_Preview')
      .getHTML(divContaining('Third'), function(err, html) {
        html.should.match(/MathJax_Preview/);
      })
      .call(done);
  });

  it('MathJax Renders after Reset (inpor-03)', function(done) {
    browser
      .submitItem()
      .resetItem()
      .pause(500)
      .waitForVisible('.choice .MathJax_Preview')
      .getHTML(divContaining('Third'), function(err, html) {
        html.should.match(/MathJax_Preview/);
      })
      .call(done);
  });




});