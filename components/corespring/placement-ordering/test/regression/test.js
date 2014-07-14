/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('placement ordering', function() {

  var itemJsonFilename = 'one.json';

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  describe('correctness', function() {
    beforeEach(function() {
      browser
        .url(RegressionHelper.getUrl('placement-ordering', itemJsonFilename))
        .waitFor('.view-placement-ordering', 2000);
    });

    it('correct answer results in correct feedback', function(done) {
      browser
        .dragAndDrop('//div[text()="Apple"]', '.landing-place')
        .dragAndDrop('//div[text()="Pear"]', '.landing-place')
        .submitItem()
        .waitFor('.feedback-correct', 2000)
        .call(done);
    });

    it('incorrect answer results in incorrect feedback', function(done) {
      browser
        .dragAndDrop('//div[text()="Banana"]', '.landing-place')
        .dragAndDrop('//div[text()="Apple"]', '.landing-place')
        .submitItem()
        .waitFor('.feedback-incorrect', 2000)
        .call(done);
    });

    it('one correct answer results in partially correct item', function(done) {
      browser
        .dragAndDrop('//div[text()="Apple"]', '.landing-place')
        .dragAndDrop('//div[text()="Banana"]', '.landing-place')
        .submitItem()
        .waitFor('.feedback-partial', 2000)
        .call(done);
    });
  });

});
