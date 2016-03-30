/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

describe('inplace ordering', function() {

  var itemJsonFilename = 'inplace.json';

  var divContaining = function(s) {
    return "//div[text()[contains(., '" + s + "')]]";
  };

  beforeEach(function(done) {

    browser.submitItem = function() {
      this.execute('window.submit()');
      return this;
    };

    browser.resetItem = function() {
      this.execute('window.reset()');
      return this;
    };

    browser
      .url(browser.options.getUrl('ordering', itemJsonFilename))
      .waitForVisible('.player-rendered')
      .call(done);
  });

  it('submitting without interaction results in warning feedback', function(done) {
    browser
      .submitItem()
      .waitFor('.feedback.warning')
      .call(done);
  });

  it('MathJax Renders', function(done) {
    browser
      .waitForVisible('.choice .MathJax_Preview')
      .getHTML(divContaining('Third'), function(err, html) {
        html.should.match(/MathJax_Preview/);
      })
      .call(done);
  });

  it('MathJax Renders after Reset', function(done) {
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