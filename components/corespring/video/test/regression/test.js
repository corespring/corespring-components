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
      browser.options.extendBrowser(browser);

      browser
        .loadTest(componentName, itemJsonFilename)
        .call(done);
    });

    it('video is visible', function(done) {
      browser
        .isVisible('.cs-video', function(err, result) {
          expect(result).to.equal(true);
        })
        .call(done);
    });

    it('video is the proper size', function(done) {
      browser
        .getElementSize('.cs-video-player-frame', function(err, result) {
          expect(result.width).to.equal(320);
          expect(result.height).to.equal(240);
        })
        .call(done);
    });
  });

  describe('vimeo', function() {
    var itemJsonFilename = 'vimeo.json';

    beforeEach(function(done) {
      browser.options.extendBrowser(browser);

      browser
        .loadTest(componentName, itemJsonFilename)
        .call(done);
    });

    it('video is visible', function(done) {
      browser
        .isVisible('.cs-video', function(err, result) {
          expect(result).to.equal(true);
        })
        .call(done);
    });

    it('video is the proper size', function(done) {
      browser
        .getElementSize('.cs-video-player-frame', function(err, result) {
          expect(result.width).to.equal(480);
          expect(result.height).to.equal(270);
        })
        .call(done);
    });
  });
});