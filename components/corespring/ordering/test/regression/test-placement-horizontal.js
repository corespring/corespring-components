/* global browser, regressionTestRunnerGlobals */

var _ = require('lodash');
var should = require('should');

var RegressionHelper = (function() {
  var RegressionHelperDef = require('./../../../../../helper-libs/regression-helper');
  return new RegressionHelperDef(regressionTestRunnerGlobals.baseUrl);
})();

describe('placement ordering', function() {

  var itemJsonFilename = 'placement-horizontal.json';

  var divContaining = function(s) {
    return "//div[text()[contains(., '" + s + "')]]";
  };

  var divWithClass = function(s) {
    return "//div[@class[contains(., '" + s + "')]]";
  };

  var landingPlace = function(index) {
    return divWithClass('answer-area-table')+divWithClass('choice-wrapper')+'['+index+']';
  };

  browser.submitItem = function() {
    this.execute('window.submit()');
    return this;
  };

  browser.resetItem = function() {
    this.execute('window.reset()');
    return this;
  };

  describe('horizontal', function() {

    describe('correctness', function() {
      beforeEach(function() {
        browser
          .url(RegressionHelper.getUrl('ordering', itemJsonFilename))
          .waitFor('.view-placement-ordering', regressionTestRunnerGlobals.defaultTimeout);
      });

      it('correct answer results in correct feedback', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Pear'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.correct', regressionTestRunnerGlobals.defaultTimeout)
          .call(done);
      });

      it('incorrect answer results in incorrect feedback', function(done) {
        browser
          .dragAndDrop(divContaining('Banana'), landingPlace(1))
          .dragAndDrop(divContaining('Apple'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.incorrect', regressionTestRunnerGlobals.defaultTimeout)
          .call(done);
      });

      it('one correct answer results in partially correct item', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.partial', regressionTestRunnerGlobals.defaultTimeout)
          .call(done);
      });

      it('correct answer is shown after submission of incorrect answer', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitFor('.see-answer-panel')
          .click('.see-answer-panel .panel-heading')
          .waitFor(divWithClass('see-answer-panel')+divContaining('Apple'), regressionTestRunnerGlobals.defaultTimeout)
          .waitFor(divWithClass('see-answer-panel')+divContaining('Pear'), regressionTestRunnerGlobals.defaultTimeout)
          .call(done);
      });

      it('choices dont have correctness indication after reset', function(done) {
        browser
          .dragAndDrop(divContaining('Apple'), landingPlace(1))
          .dragAndDrop(divContaining('Banana'), landingPlace(2))
          .submitItem()
          .waitFor('.feedback.partial', regressionTestRunnerGlobals.defaultTimeout)
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
