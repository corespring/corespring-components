/* global browser, regressionTestRunnerGlobals */

var should = require('should');
var expect = require('chai').expect;
var fs = require('fs');
var _ = require('lodash');

describe('video component', function() {

  describe('youtube', function() {
    var itemJsonFilename = 'youtube.json';

    beforeEach(function(done) {
      browser.url(browser.getTestUrl('video', itemJsonFilename))
      browser.waitForVisible('.cs-video');
      browser.call(done);
    });

    it('video is visible', function(done) {
      browser.waitForVisible('.cs-video');
      browser.call(done);
    });

    it('video is the proper size', function(done) {
      browser.waitForVisible('.cs-video-player-frame');
      var result = browser.getElementSize('.cs-video-player-frame');
      expect(result.width).to.equal(320);
      expect(result.height).to.equal(240);
      browser.call(done);
    });
  });

  describe('vimeo', function() {
    var itemJsonFilename = 'vimeo.json';

    beforeEach(function() {
      browser.url(browser.getTestUrl('video', itemJsonFilename))
      browser.waitForVisible('.cs-video');
    });

    it('video is visible', function(done) {
      browser.waitForVisible('.cs-video');
      browser.call(done);
    });

    it('video is the proper size', function(done) {
      browser.waitForVisible('.cs-video-player-frame');
      var result = browser.getElementSize('.cs-video-player-frame');
      expect(result.width).to.equal(480);
      expect(result.height).to.equal(270);
      browser.call(done);
    });
  });
});