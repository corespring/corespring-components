/* global broadcast, browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');

describe('webdriver-test-component', function() {

  "use strict";

  var componentName = 'webdriver-test-component';
  var itemJsonFilename = 'render-regression-test.json';

  beforeEach(function(done) {
    browser.options.extendBrowser(browser);

    browser
      .loadTest(componentName, itemJsonFilename)
      .call(done);
  });

  describe('waitForVisible', function() {

    describe('visible from the start', function() {
      var selector = '.visible-from-the-start';

      it('should not fail', function(done) {
        browser
          .waitForVisible(selector)
          .call(done);
      });

      /* expected failure
      it('should fail when inverted', function(done) {
        browser
          .waitForVisible(selector, browser.options.defaultTimeout, true)
          .call(function() {
            throw "This test was expected to fail";
          });
      });
      */

      it('should call callback', function(done) {
        var callbackCalled = false;
        browser
          .waitForVisible(selector, function(err, res) {
            expect(err).toNotExist();
            expect(res).toBe(true);
            callbackCalled = true;
          })
          .call(function() {
            expect(callbackCalled).toBe(true);
            done();
          });
      });

    });

    describe('hidden from the start', function() {
      var selector = '.hidden-from-the-start';

      /* expected failure
      it('should fail', function(done) {
        browser
          .waitForVisible(selector)
          .call(function() {
            throw "This test was expected to fail";
          });
      });
      */

      it('should not fail, when inverted', function(done) {
        browser
          .waitForVisible(selector, browser.options.defaultTimeout, true)
          .call(done);
      });


      it('should call callback with error', function(done) {
        var callbackCalled = false;
        browser
          .waitForVisible(selector, function(err, res) {
            expect(err).toExist();
            expect(res).toBe(false);
            callbackCalled = true;
          })
          .call(function() {
            expect(callbackCalled).toBe(true);
            done();
          });
      });
    });

    describe('non existent item', function() {
      var selector = '.addable';

      /* expected failure
      it('should fail', function(done) {
        browser
          .waitForVisible(selector)
          .call(function() {
            throw "This test was expected to fail";
          });
      });
      */

      /* expected failure
      it('should fail even when inverted', function(done) {
        browser
          .waitForVisible(selector, browser.options.defaultTimeout, true)
          .call(function() {
            throw "This test was expected to fail";
          });
      });
      */

      it('should call callback with error', function(done) {
        var callbackCalled = false;
        browser
          .waitForVisible(selector, function(err, res) {
            expect(err).toExist();
            expect(res).toBe(false);
            callbackCalled = true;
          })
          .call(function() {
            expect(callbackCalled).toBe(true);
            done();
          });
      });
    });

    describe('adding an item', function() {
      var selector = '.addable';

      /* expected failure
      it('should fail before item has been added', function(done) {
        browser
          .waitForVisible(selector)
          .call(function() {
            throw "This test was expected to fail";
          });
      });
      */

      it('should succeed after item has been added', function(done) {
        browser
          .execute(function() {
            broadcast("callMethod", {
              method: "addAddable",
              args: []
            });
          })
          .waitForVisible(selector)
          .call(done);
      });
    });

    describe('removing an item', function() {
      var selector = '.removable';

      it('should succeed before item has been removed', function(done) {
        browser
          .waitForVisible(selector)
          .call(done);
      });

      /*
      it('should fail after item has been removed', function(done) {
        browser
          .execute(function() {
            broadcast("callMethod", {
              method: "removeRemovable",
              args: []
            });
          })
          .waitForVisible(selector)
          .call(function() {
            throw "This test was expected to fail";
          });
      });
      */

    });

  });

});