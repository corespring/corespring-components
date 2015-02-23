/* global browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var should = require('should');
var fs = require('fs');
var _ = require('lodash');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('drag and drop inline v201', function() {

  "use strict";

  var itemJsonFilename = 'one.json';
  var componentName = 'drag-and-drop-inline-v201';
  var itemJson = RegressionHelper.getItemJson(componentName, itemJsonFilename);

  var landingPlace = function(id) {
    return "//div[@id='" + id  + "']/div[1]";
  };

  var choice = function(id) {
    return "//div[@data-id='" + id + "']";
  };

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  beforeEach(function() {
    browser
      .url(RegressionHelper.getUrl(componentName, itemJsonFilename))
      .waitFor('.corespring-drag-and-drop-inline-render-v201', regressionTestRunnerGlobals.defaultTimeout);
  });

  it('correct answer results in correct feedback', function(done) {
    browser
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.correct', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('superfluous answer results in partial feedback', function(done) {
    browser
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.partial', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('incorrect answer results in incorrect feedback', function(done) {
    browser
      .dragAndDrop(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.feedback.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('incorrect answer is marked as incorrect', function(done) {
    browser
      .dragAndDrop(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('correct answer is marked as correct', function(done) {
    browser
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .dragAndDrop(choice('c_1'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.correct', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('correct answer in wrong position is marked as incorrect', function(done) {
    browser
      .dragAndDrop(choice('c_1'), landingPlace('aa_1'))
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });

  it('superfluous answer is marked as incorrect', function(done) {
    browser
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .dragAndDrop(choice('c_2'), landingPlace('aa_1'))
      .submitItem()
      .waitFor('.selected-choice.incorrect', regressionTestRunnerGlobals.defaultTimeout)
      .call(done);
  });



});
