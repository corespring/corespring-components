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
    browser.options.extendBrowser(browser);

    browser
      .loadTest(componentName, itemJsonFilename)
      .call(done);
  });

  describe('vertical', function() {

    describe('correctness', function() {

      it('correct answer results in correct feedback (porv-01)', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Pear'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.correct')
          .call(done);
      });

      it('incorrect answer results in incorrect feedback (porv-02)', function(done) {
        browser
          .dragAndDrop(divContaining('Banana'), landingPlace(1))
          .dragAndDrop(divContaining('Apple'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.incorrect')
          .call(done);
      });

      it('one correct answer results in partially correct item (porv-03)', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.partial')
          .call(done);
      });

      it('correct answer is not visible after reset (porv-04)', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitAndClick('.show-correct-button')
          .getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            expect(attr).toNotContain('ng-hide');
          })
          .resetItem()
          .getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            expect(attr).toContain('ng-hide');
          })
          .call(done);
      });

      it('correct answer is not visible after reset and submit (porv-05)', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .click('.show-correct-button')
          .getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            expect(attr).toNotContain('ng-hide');
          })
          .resetItem()
          .submitItem()
          .getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            expect(attr).toContain('ng-hide');
          })
          .call(done);
      });

      it('choices dont have correctness indication after reset (porv-06)', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.partial')
          .resetItem()
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .getAttribute('.answer-area .choice', 'class', function(err, attr) {
            if (_.isArray(attr)) {
              _.each(attr, function(a) {
                a.should.not.match(/correct/);
              });
            } else {
              attr.should.not.match(/correct/);
            }
          })
          .resetItem()
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .getAttribute('.answer-area .choice', 'class', function(err, attr) {
            if (_.isArray(attr)) {
              _.each(attr, function(a) {
                a.should.not.match(/correct/);
              });
            } else {
              attr.should.not.match(/correct/);
            }
          })
          .call(done);
      });
    });

    describe('MathJax', function() {
      it('renders (porv-07)', function(done) {
        browser
          .waitForVisible('.choice .MathJax_Preview')
          .getHTML(divContaining('Apple'), function(err, html) {
            html.should.match(/MathJax_Preview/);
          })
          .call(done);
      });
      it('renders after Reset (porv-08)', function(done) {
        browser
          .submitItem()
          .resetItem()
          .pause(500)
          .waitForVisible('.choice .MathJax_Preview')
          .getHTML(divContaining('Apple'), function(err, html) {
            html.should.match(/MathJax_Preview/);
          })
          .call(done);
      });

    });
  });
});

