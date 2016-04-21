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

    describe('no content with text', function() {
      var selector = '.no-content-2';

      it('succeeds (wdtc-wfv-11)', function(done) {
        browser.execute(function(){
          setTimeout(function() {
            broadcast('callMethod', {method: 'addDivWithText'});
          }, 3000);
        });
        browser.waitForVisible(selector);
        browser.call(done);
      });

      it('return false bc the thing has no content initially (wdtc-wfv-12)', function(done) {
        expect(browser.isVisible(selector)).toBe(false);
        browser.call(done);
      });
    });

    describe('no content with empty div', function() {
      var selector = '.no-content-1';

      it('fails bc the thing still has no content after adding the empty div (wdtc-wfv-13)', function(done) {
        browser.execute(function(){
          setTimeout(function() {
            broadcast('callMethod', {method: 'addEmptyDiv'});
          }, 3000);
        });
        browser.waitForVisible(selector);
        browser.call(done);
      });

      it('return false bc the thing has no content initially (wdtc-wfv-11)', function(done) {
        expect(browser.isVisible(selector)).toBe(false);
        browser.call(done);
      });
    });

  });

});