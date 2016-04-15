/* global broadcast, browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');

describe('webdriver-test-component', function() {

  "use strict";

  var componentName = 'webdriver-test-component';
  var itemJsonFilename = 'render-regression-test.json';

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename)
    browser.call(done);
  });

  describe('waitForVisible', function() {

    describe('visible from the start', function() {
      var selector = '.visible-from-the-start';

      it('should not fail', function(done) {
        browser.waitForVisible(selector)
        browser.call(done);
      });

      it('should fail when inverted', function(done) {
        browser.waitForVisible(selector, browser.options.defaultTimeout, true);
        browser.call(done);
      });
    });

    describe('hidden from the start', function() {
      var selector = '.hidden-from-the-start';

      /* expected failure
      it('should fail', function(done) {
        browser.waitForVisible(selector)
        browser.call(function() {
          throw "This test was expected to fail";
        });
      });
      */

      it('should not fail, when inverted', function(done) {
        browser.waitForVisible(selector, browser.options.defaultTimeout, true)
        browser.call(done);
      });

    });

    describe('non existent item', function() {
      var selector = '.addable';

      /* expected failure
      it('should fail', function(done) {
        browser.waitForVisible(selector)
        browser.call(function() {
          throw "This test was expected to fail";
        });
      });
      */

      /* expected failure */
      it('should fail even when inverted', function(done) {
        browser.waitForVisible(selector, browser.options.defaultTimeout, true)
        browser.call(function() {
          throw "This test was expected to fail";
        });
      });
    });

    describe('adding an item', function() {
      var selector = '.addable';

      it('should succeed before item has been added', function(done) {
        browser.waitForVisible(selector, browser.options.defaultTimeout, true);
      });

      it('should succeed after item has been added', function(done) {
        browser.execute(function() {
          broadcast("callMethod", {
            method: "addAddable",
            args: []
          });
        })
        browser.waitForVisible(selector)
        browser.call(done);
      });
    });

    describe('removing an item', function() {
      var selector = '.removable';

      it('should succeed before item has been removed', function(done) {
        browser.waitForVisible(selector);
        browser.call(done);
      });

      it('should succeed after item has been removed', function(done) {
        browser.execute(function() {
          broadcast("callMethod", {
            method: "removeRemovable",
            args: []
          });
        })
        browser.waitForVisible(selector, browser.options.defaultTimeout, true);
      });

    });

  });

});