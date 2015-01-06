/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('ordering', function() {

  var itemJsonFilename = 'one.json';

  browser.submitItem = function() {
    this.execute('window.submit()');
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
        .dragAndDrop('//div[text()="Apple"]', '.landing-place')
        .dragAndDrop('//div[text()="Pear"]', '.landing-place')
        .submitItem()
        .waitFor('.feedback.correct', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });

    it('incorrect answer results in incorrect feedback', function(done) {
      browser
        .dragAndDrop('//div[text()="Banana"]', '.landing-place')
        .dragAndDrop('//div[text()="Apple"]', '.landing-place')
        .submitItem()
        .waitFor('.feedback.incorrect', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });

    it('one correct answer results in partially correct item', function(done) {
      browser
        .dragAndDrop('//div[text()="Apple"]', '.landing-place')
        .dragAndDrop('//div[text()="Banana"]', '.landing-place')
        .submitItem()
        .waitFor('.feedback.partial', regressionTestRunnerGlobals.defaultTimeout)
        .call(done);
    });
  });

});
