/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var expect = require('expect');
var should = require('should');

describe('placement ordering (porv)', function() {

  var componentName = 'ordering';
  var itemJsonFilename = 'placement-vertical.json';

  var divContaining = function(s) {
    return "//div[text()[contains(., '" + s + "')]]";
  };

  var landingPlace = function(index) {
    return '//div[@class[contains(., "answer-area-table")]]//div[@class[contains(., "choice-wrapper")]][' + index + ']';
  };

  beforeEach(function(done) {
    browser.loadTest(componentName, itemJsonFilename);
    browser.call(done);
  });

  describe('vertical', function() {

    describe('correctness', function() {

      it('correct answer results in correct feedback (porv-01)', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Pear'), landingPlace(2));
        browser.submitItem();
        browser.waitForVisible('.feedback.correct');
        browser.call(done);
      });

      it('incorrect answer results in incorrect feedback (porv-02)', function(done) {
        browser.dragAndDrop(divContaining('Banana'), landingPlace(1));
        browser.dragAndDrop(divContaining('Apple'), landingPlace(2));
        browser.submitItem();
        browser.waitForVisible('.feedback.incorrect');
        browser.call(done);
      });

      it('one correct answer results in partially correct item (porv-03)', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.waitForVisible('.feedback.partial');
        browser.call(done);
      });

      it('correct answer is not visible after reset (porv-04)', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.waitAndClick('.show-correct-button');
        browser.getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
          expect(attr).toNotContain('ng-hide');
        });
        browser.resetItem();
        browser.getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
          expect(attr).toContain('ng-hide');
        });
        browser.call(done);
      });

      it('correct answer is not visible after reset and submit (porv-05)', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.click('.show-correct-button');
        browser.getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
          expect(attr).toNotContain('ng-hide');
        });
        browser.resetItem();
        browser.submitItem();
        browser.getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
          expect(attr).toContain('ng-hide');
        });
        browser.call(done);
      });

      it('choices dont have correctness indication after reset (porv-06)', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.waitForVisible('.feedback.partial');
        browser.resetItem();
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.getAttribute('.answer-area .choice', 'class', function(err, attr) {
          if (_.isArray(attr)) {
            _.each(attr, function(a) {
              a.should.not.match(/correct/);
            });
          } else {
            attr.should.not.match(/correct/);
          }
        });
        browser.resetItem();
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.getAttribute('.answer-area .choice', 'class', function(err, attr) {
          if (_.isArray(attr)) {
            _.each(attr, function(a) {
              a.should.not.match(/correct/);
            });
          } else {
            attr.should.not.match(/correct/);
          }
        });
        browser.call(done);
      });
    });

    describe('MathJax', function() {
      it('renders (porv-07)', function(done) {
        browser.waitForExist('.choice .MathJax_Preview');
        browser.getHTML(divContaining('Apple')).should.match(/MathJax_Preview/);
        browser.call(done);
      });
      it('renders after Reset (porv-08)', function(done) {
        browser.submitItem();
        browser.resetItem();
        browser.pause(500);
        browser.waitForExist('.choice .MathJax_Preview');
        browser.getHTML(divContaining('Apple')).should.match(/MathJax_Preview/);
        browser.call(done);
      });

    });
  });
});