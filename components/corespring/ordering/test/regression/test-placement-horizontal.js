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

  describe('horizontal', function() {

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

      it('correct answer is shown after submission of incorrect answer', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.waitForVisible('.see-answer-panel');
        browser.click('.see-answer-panel .panel-heading');
        browser.waitForVisible(divWithClass('see-answer-panel') + divContaining('Apple'));
        browser.waitForVisible(divWithClass('see-answer-panel') + divContaining('Pear'));
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