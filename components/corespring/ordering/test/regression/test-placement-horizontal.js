/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

describe('placement ordering (porh)', function() {

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
    browser.loadTest(componentName, itemJsonFilename);
    browser.call(done);
  });


  describe('horizontal', function() {

    describe('correctness', function() {

      it('correct answer results in correct feedback (porh-01)', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Pear'), landingPlace(2));
        browser.submitItem();
        browser.waitForExist('.feedback.correct');
        browser.call(done);
      });

      it('incorrect answer results in incorrect feedback (porh-02)', function(done) {
        browser.dragAndDrop(divContaining('Banana'), landingPlace(1));
        browser.dragAndDrop(divContaining('Apple'), landingPlace(2));
        browser.submitItem();
        browser.waitForExist('.feedback.incorrect');
        browser.call(done);
      });

      it('one correct answer results in partially correct item (porh-03)', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.waitForExist('.feedback.partial');
        browser.call(done);
      });

      it('correct answer is shown after submission of incorrect answer (porh-04)', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.waitAndClick('.see-answer-panel .panel-heading');
        browser.waitForVisible(divWithClass('see-answer-panel') + divContaining('Apple'));
        browser.waitForVisible(divWithClass('see-answer-panel') + divContaining('Pear'));
        browser.call(done);
      });

      it('choices dont have correctness indication after reset (porh-05)', function(done) {
        browser.dragAndDrop(divContaining('Apple'), landingPlace(1));
        browser.dragAndDrop(divContaining('Banana'), landingPlace(2));
        browser.submitItem();
        browser.waitForExist('.feedback.partial');
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
      it('renders (porh-06)', function(done) {
        browser.waitForExist('.choice .MathJax_Preview');
        browser.getHTML(divContaining('Apple'), function(err, html) {
          html.should.match(/MathJax_Preview/);
        });
        browser.call(done);
      });
      it('renders after Reset (porh-07)', function(done) {
        browser.submitItem();
        browser.resetItem();
        browser.pause(500);
        browser.waitForExist('.choice .MathJax_Preview');
        browser.getHTML(divContaining('Apple'), function(err, html) {
          html.should.match(/MathJax_Preview/);
        });
        browser.call(done);
      });

    });
  });


});