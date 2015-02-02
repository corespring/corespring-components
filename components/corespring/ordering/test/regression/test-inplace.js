/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('inplace ordering', function() {

  var itemJsonFilename = 'inplace.json';
  var liContaining = function(s) {
    return "//div[text()[contains(., '" + s + "')]]";
  };

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

  describe('correctness', function() {
    beforeEach(function() {
      browser
        .url(RegressionHelper.getUrl('ordering', itemJsonFilename))
        .waitFor('.view-ordering', regressionTestRunnerGlobals.defaultTimeout);
    });

    it('correct answer results in correct feedback', function(done) {
      browser
        .submitItem()
        .waitFor('.feedback.correct', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });

    it('MathJax Renders', function(done) {
      browser
        .waitFor('.choice')
        .getHTML(divContaining('Third'), function(err, html) {
          html.should.match(/MathJax_Preview/);
        })
        .call(done);
    });

    it('MathJax Renders after Reset', function(done) {
      browser
        .submitItem()
        .resetItem()
        .getHTML(divContaining('Third'), function(err, html) {
          html.should.match(/MathJax_Preview/);
        })
        .call(done);
    });


  });


});
