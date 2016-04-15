/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

describe('placement ordering', function() {

  var componentName = 'ordering';
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
    browser.options.extendBrowser(browser);

    browser
      .loadTest(componentName, itemJsonFilename)
      .call(done);
  });


  describe('horizontal', function() {

    describe('correctness', function() {

      it('correct answer results in correct feedback', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Pear'), landingPlace(2))
          .submitItem()
          .waitForExist('.feedback.correct')
          .call(done);
      });

      it('incorrect answer results in incorrect feedback', function(done) {
        browser
          .dragAndDrop(divContaining('Banana'), landingPlace(1))
          .dragAndDrop(divContaining('Apple'), landingPlace(2))
          .submitItem()
          .waitForExist('.feedback.incorrect')
          .call(done);
      });

      it('one correct answer results in partially correct item', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitForExist('.feedback.partial')
          .call(done);
      });

      it('correct answer is shown after submission of incorrect answer', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitAndClick('.see-answer-panel .panel-heading')
          .waitForExist(divWithClass('see-answer-panel') + divContaining('Apple'))
          .waitForExist(divWithClass('see-answer-panel') + divContaining('Pear'))
          .call(done);
      });

      it('choices dont have correctness indication after reset', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitForExist('.feedback.partial')
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