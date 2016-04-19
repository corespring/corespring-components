/* global broadcast, browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');

describe('webdriver-test-component (wdtc-wfe)', function() {

  "use strict";

  var componentName = 'webdriver-test-component';
  var itemJsonFilename = 'render-regression-test.json';

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    expect(browser.getTitle()).toBe('rig');
    browser.call(done);
  });

  describe('waitForExist', function() {

    describe('visible from the start (wdtc-wfe-01)', function() {
      var selector = '.visible-from-the-start';

      it('should not fail', function(done) {
        browser.waitForExist(selector);
        browser.call(done);
      });

      /* expected to fail
      it('Should fail, when inverted (wdtc-wfe-02)', function(done) {
        browser.waitForExist(selector, 2000, true)
        browser.call(done);
      });
      */

    });

    describe('hidden from the start', function() {
      var selector = '.hidden-from-the-start';

      it('should not fail (wdtc-wfe-03)', function(done) {
        browser.waitForExist(selector);
        browser.call(done);
      });
    });

    describe('non existent item', function() {
      var selector = '.addable';

      /* expected to fail
      it('Should fail (wdtc-wfe-04)', function(done) {
        browser.waitForExist(selector);
        browser.call(done);
      });
      */

      it('NOTE: Does not fail, when inverted (wdtc-wfe-05)', function(done) {
        browser.waitForExist(selector, 2000, true);
        browser.call(done);
      });

    });

    describe('adding an item', function() {
      var selector = '.addable';

      /* expected failure
      it('should fail before item has been added (wdtc-wfe-06)', function(done) {
       browser.waitForExist(selector);
      });
      */


      it('should succeed after item has been added (wdtc-wfe-07)', function(done) {
        browser.execute(function() {
            broadcast("callMethod", {
              method: "addAddable",
              args: []
            });
          });
        browser.waitForExist(selector);
        browser.call(done);
      });
    });

    describe('removing an item', function() {
      var selector = '.removable';

      it('should succeed before item has been removed (wdtc-wfe-08)', function(done) {
        browser.waitForExist(selector);
        browser.call(done);
      });

      /* expected to fail
      it('should fail after item has been removed (wdtc-wfe-09)', function(done) {
        browser.execute(function() {
            broadcast("callMethod", {
              method: "removeRemovable",
              args: []
            });
          });
        browser.waitForExist(selector);
        browser.call(done);
      });
      */

    });

  });

});