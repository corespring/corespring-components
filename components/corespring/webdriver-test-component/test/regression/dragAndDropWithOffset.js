/* global broadcast, browser, regressionTestRunnerGlobals, require, describe, console, beforeEach, it */

var expect = require('expect');

describe('webdriver-test-component (wdtc-dndwo)', function() {

  "use strict";

  var componentName = 'webdriver-test-component';
  var itemJsonFilename = 'render-regression-test.json';

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    expect(browser.getTitle()).toBe('rig');
    browser.call(done);
  });

  describe('dragAndDrop', function() {

    it('should not fail (wdtc-dndwo-01)', function(done) {
      browser.dragAndDropWithOffset('.draggable', '.droppable');
      browser.pause(1000);
      var text = browser.getText('.droppable');
      expect(text).toBe('draggable model');
      browser.call(done);
    });
  });

});