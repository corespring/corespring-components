/* global browser, regressionTestRunnerGlobals */

var should = require('should');
var expect = require('chai').expect;
var fs = require('fs');
var _ = require('lodash');

describe('video component', function() {
  var componentName = 'video';

  describe('youtube', function() {

    var itemJsonFilename = 'youtube.json';

    beforeEach(function(done) {
      browser.loadTest(componentName, itemJsonFilename);
      browser.call(done);
    });

    it('video is visible', function(done) {
      browser.waitForVisible('.cs-video');
      browser.call(done);
    });

    it('video is the proper size', function(done) {
      var size = browser.getElementSize('.cs-video-player-frame');
      expect(size.width).to.equal(320);
      expect(size.height).to.equal(240);
      browser.call(done);
    });
  });

  describe('vimeo', function() {
    var itemJsonFilename = 'vimeo.json';

    beforeEach(function(done) {
      browser.loadTest(componentName, itemJsonFilename);
      browser.call(done);
    });

    it('video is visible', function(done) {
      browser.waitForVisible('.cs-video');
      browser.call(done);
    });

    it('video is the proper size', function(done) {
      var size = browser.getElementSize('.cs-video-player-frame');
      expect(size.width).to.equal(480);
      expect(size.height).to.equal(270);
      browser.call(done);
    });
  });
});