/* global broadcast, browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');

describe('webdriver-test-component (wdtc-wfv)', function() {

  "use strict";

  var componentName = 'webdriver-test-component';
  var itemJsonFilename = 'render-regression-test.json';

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    expect(browser.getTitle()).toBe('rig');
    browser.call(done);
  });

  describe('waitForVisible', function() {

    describe('no content', function() {
      var selector = '.no-content';

      /* expected to fail
       it('fails bc the thing has no content (wdtc-wfv-11)', function(done) {
        browser.waitForVisible(selector);
        browser.call(done);
      });
      */

      it('return true bc, the thing has no content (wdtc-wfv-11)', function(done) {
        expect(browser.isVisible(selector)).toBe(false);
        browser.call(done);
      });
    });

    describe('visible from the start', function() {
      var selector = '.visible-from-the-start';

      it('should not fail (wdtc-wfv-01)', function(done) {
        browser.waitForVisible(selector);
        browser.call(done);
      });

      /* expected to fail
      it('should fail when inverted (wdtc-wfv-02)', function(done) {
        browser.waitForVisible(selector, browser.options.defaultTimeout, true);
        browser.call(done);
      });
      */
    });

    describe('hidden from the start', function() {
      var selector = '.hidden-from-the-start';

      /* expected failure
      it('should fail (wdtc-wfv-03)', function(done) {
        browser.waitForVisible(selector);
        browser.call(function() {
          throw "This test was expected to fail";
        });
      });
      */

      it('should not fail, when inverted (wdtc-wfv-04)', function(done) {
        browser.waitForVisible(selector, browser.options.defaultTimeout, true);
        browser.call(done);
      });

    });

    describe('non existent item', function() {
      var selector = '.addable';

      /* expected failure
      it('should fail (wdtc-wfv-05)', function(done) {
        browser.waitForVisible(selector);
        browser.call(function() {
          throw "This test was expected to fail";
        });
      });
      */

      /* expected failure */
      it('should fail even when inverted (wdtc-wfv-06)', function(done) {
        browser.waitForVisible(selector, browser.options.defaultTimeout, true);
        browser.call(function() {
          throw "This test was expected to fail";
        });
      });
    });

    describe('adding an item', function() {
      var selector = '.addable';

      it('should succeed before item has been added (wdtc-wfv-07)', function(done) {
        browser.waitForVisible(selector, browser.options.defaultTimeout, true);
      });

      it('should succeed after item has been added (wdtc-wfv-08)', function(done) {
        browser.execute(function() {
          broadcast("callMethod", {
            method: "addAddable",
            args: []
          });
        });
        browser.waitForVisible(selector);
        browser.call(done);
      });
    });

    describe('removing an item', function() {
      var selector = '.removable';

      it('should succeed before item has been removed (wdtc-wfv-09)', function(done) {
        browser.waitForVisible(selector);
        browser.call(done);
      });

      it('should succeed after item has been removed (wdtc-wfv-10)', function(done) {
        browser.execute(function() {
          broadcast("callMethod", {
            method: "removeRemovable",
            args: []
          });
        });
        browser.waitForVisible(selector, browser.options.defaultTimeout, true);
      });

    });

  });

});