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

  describe('vertical', function() {

    describe('correctness', function() {
      beforeEach(function() {
        browser
          .url(browser.options.getUrl('ordering', itemJsonFilename))
          .waitFor('.view-placement-ordering', browser.options.defaultTimeout);
      });

      it('correct answer results in correct feedback', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Pear'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.correct', browser.options.defaultTimeout)
          .call(done);
      });

      it('incorrect answer results in incorrect feedback', function(done) {
        browser
          .dragAndDrop(divContaining('Banana'), landingPlace(1))
          .dragAndDrop(divContaining('Apple'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.incorrect', browser.options.defaultTimeout)
          .call(done);
      });

      it('one correct answer results in partially correct item', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.partial', browser.options.defaultTimeout)
          .call(done);
      });

      it('correct answer is not visible after reset', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .click('.show-correct-button')
          .getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            attr.should.not.match(/ng-hide/);
          })
          .resetItem()
          .getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            attr.should.match(/ng-hide/);
          })
          .call(done);
      });

      it('correct answer is not visible after reset and submit', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .click('.show-correct-button')
          .getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            attr.should.not.match(/ng-hide/);
          })
          .resetItem()
          .submitItem()
          .getAttribute('.see-answer-area .choices', 'class', function(err, attr) {
            attr.should.match(/ng-hide/);
          })
          .call(done);
      });

      it('choices dont have correctness indication after reset', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.partial', browser.options.defaultTimeout)
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
      it('renders', function(done) {
        browser
          .waitFor('.choice')
          .getHTML(divContaining('Apple'), function(err, html) {
            html.should.match(/MathJax_Preview/);
          })
          .call(done);
      });
      it('renders after Reset', function(done) {
        browser
          .submitItem()
          .resetItem()
          .getHTML(divContaining('Apple'), function(err, html) {
            html.should.match(/MathJax_Preview/);
          })
          .call(done);
      });

    });
  });
});
