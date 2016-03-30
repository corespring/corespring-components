/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

describe('placement ordering', function() {

  var itemJsonFilename = 'placement-horizontal.json';

  var divContaining = function(s) {
    return "//div[text()[contains(., '" + s + "')]]";
  };

  var divWithClass = function(s) {
    return "//div[@class[contains(., '" + s + "')]]";
  };

  var landingPlace = function(index) {
    return divWithClass('answer-area-table') + divWithClass('choice-wrapper') + '[' + index + ']';
  };

  beforeEach(function(done) {
    browser.waitingDragAndDrop = function(fromSelector, toSelector) {
      return this
        .waitForExist(fromSelector)
        .waitForExist(toSelector)
        .dragAndDrop(fromSelector, toSelector);
    };

    browser.submitItem = function() {
      this.execute('window.submit()');
      return this;
    };

    browser.resetItem = function() {
      this.execute('window.reset()');
      return this;
    };
    browser.call(done);
  });

  describe('horizontal', function() {

    describe('correctness', function() {
      beforeEach(function(done) {
        browser
          .url(browser.options.getUrl('ordering', itemJsonFilename))
          .waitForExist('.player-rendered')
          .call(done);
      });

      it('correct answer results in correct feedback', function(done) {
        browser
          .waitingDragAndDrop(divContaining('Apple'), landingPlace(1))
          .waitingDragAndDrop(divContaining('Pear'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.correct')
          .call(done);
      });

      it('incorrect answer results in incorrect feedback', function(done) {
        browser
          .waitingDragAndDrop(divContaining('Banana'), landingPlace(1))
          .waitingDragAndDrop(divContaining('Apple'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.incorrect')
          .call(done);
      });

      it('one correct answer results in partially correct item', function(done) {
        browser
          .waitingDragAndDrop(divContaining('Apple'), landingPlace(1))
          .waitingDragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.partial')
          .call(done);
      });

      it('correct answer is shown after submission of incorrect answer', function(done) {
        browser
          .waitingDragAndDrop(divContaining('Apple'), landingPlace(1))
          .waitingDragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitFor('.see-answer-panel')
          .click('.see-answer-panel .panel-heading')
          .waitFor(divWithClass('see-answer-panel') + divContaining('Apple'))
          .waitFor(divWithClass('see-answer-panel') + divContaining('Pear'))
          .call(done);
      });

      it('choices dont have correctness indication after reset', function(done) {
        browser
          .waitingDragAndDrop(divContaining('Apple'), landingPlace(1))
          .waitingDragAndDrop(divContaining('Banana'), landingPlace(2))
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
          .waitingDragAndDrop(divContaining('Banana'), landingPlace(2))
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
          .waitForVisible('.choice .MathJax_Preview')
          .getHTML(divContaining('Apple'), function(err, html) {
            html.should.match(/MathJax_Preview/);
          })
          .call(done);
      });
      it('renders after Reset', function(done) {
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