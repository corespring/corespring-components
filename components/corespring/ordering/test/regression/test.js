/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('ordering', function() {

  var itemJsonFilename = 'one.json';
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
        .waitFor('.view-placement-ordering', regressionTestRunnerGlobals.defaultTimeout);
    });

    it('correct answer results in correct feedback', function(done) {
      browser
        .dragAndDrop(divContaining('Apple'), '.landing-place')
        .dragAndDrop(divContaining('Pear'), '.landing-place')
        .submitItem()
        .waitFor('.feedback.correct', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });

    it('incorrect answer results in incorrect feedback', function(done) {
      browser
        .dragAndDrop(divContaining('Banana'), '.landing-place')
        .dragAndDrop(divContaining('Apple'), '.landing-place')
        .submitItem()
        .waitFor('.feedback.incorrect', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });

    it('one correct answer results in partially correct item', function(done) {
      browser
        .dragAndDrop(divContaining('Apple'), '.landing-place')
        .dragAndDrop(divContaining('Banana'), '.landing-place')
        .submitItem()
        .waitFor('.feedback.partial', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });

    it('choices dont have correctness indication after reset', function(done) {
      browser
        .dragAndDrop(divContaining('Apple'), '.landing-place')
        .dragAndDrop(divContaining('Banana'), '.landing-place')
        .submitItem()
        .waitFor('.feedback.partial', regressionTestRunnerGlobals.defaultTimeout)
        .resetItem()
        .dragAndDrop(divContaining('Apple'), '.landing-place')
        .getAttribute('.answer-area .choice', 'class', function(err, attr) {
          attr.should.not.match(/correct/);
        })
        .resetItem()
        .dragAndDrop(divContaining('Banana'), '.landing-place')
        .getAttribute('.answer-area .choice', 'class', function(err, attr) {
          attr.should.not.match(/correct/);
        })
        .call(done);
    });

    it('MathJax Renders', function(done) {
      browser
        .waitFor('.choice')
        .getHTML(divContaining('Apple'), function(err, html) {
          html.should.match(/MathJax_Preview/);
        })
        .call(done);
    });

  });


});
