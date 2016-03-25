/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

describe('placement ordering', function() {

  var itemJsonFilename = 'placement-vertical.json';

  var divContaining = function(s) {
    return "//div[text()[contains(., '" + s + "')]]";
  };

  var landingPlace = function(index) {
    return '//div[@class[contains(., "answer-area-table")]]//div[@class[contains(., "choice-wrapper")]][' + index + ']';
  };

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  browser.resetItem = function() {
    this.execute('window.reset()');
    return this;
  };

  beforeEach(function(done) {
    browser.url(browser.getTestUrl('ordering', itemJsonFilename));
    browser.waitForVisible('.view-placement-ordering');
    browser.call(done);
  });

  describe('vertical', function() {

    describe('correctness', function() {

      it('correct answer results in correct feedback', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Pear'), landingPlace(2));
        browser.submitItem();
        browser.waitForVisible('.feedback.correct');
        browser.call(done);
      });

      it('incorrect answer results in incorrect feedback', function(done) {
        browser.dragAndDrop(divContaining('Banana'), landingPlace(1));
        browser.dragAndDrop(divContaining('Apple'), landingPlace(2));
        browser.submitItem();
        browser.waitForVisible('.feedback.incorrect');
        browser.call(done);
      });

      it('one correct answer results in partially correct item', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.waitForVisible('.feedback.partial');
        browser.call(done);
      });

      it('correct answer is not visible after reset', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.click('.show-correct-button');
        browser.getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            attr.should.not.match(/ng-hide/);
          });
        browser.resetItem();
        browser.getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            attr.should.match(/ng-hide/);
          });
        browser.call(done);
      });

      it('correct answer is not visible after reset and submit', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.click('.show-correct-button');
        browser.getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            attr.should.not.match(/ng-hide/);
          });
        browser.resetItem();
        browser.submitItem();
        browser.getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            attr.should.match(/ng-hide/);
          });
        browser.call(done);
      });

      it('choices dont have correctness indication after reset', function(done) {
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
      it('renders', function(done) {
        browser.waitForExist('.choice .MathJax_Preview');
        browser.call(done);
      });
      it('renders after Reset', function(done) {
        browser.submitItem();
        browser.resetItem();
        browser.waitForExist('.choice .MathJax_Preview');
        browser.call(done);
      });

    });

  });
});
