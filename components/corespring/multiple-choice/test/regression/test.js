'use strict';

var should = require('should');
var fs = require('fs');

var Regression = {
  getUrl: function(componentType, jsonFile) {
    return 'http://localhost:9000/client/rig/corespring-' + componentType + '/index.html?data=regression_' + jsonFile;
  },
  getItemJson: function(jsonFile) {
    return require('./../../regression-data/' + jsonFile);
  }
};

describe('multiple-choice', function() {
  var filename = 'one.json';
  var itemJson = Regression.getItemJson(filename);
  var correctAnswer = itemJson.item.components['1'].correctResponse.value[0];

  console.log(Regression.getUrl('multiple-choice', filename));

  it('does not display incorrect feedback when correct answer selected', function(done) {

    browser
      .url(Regression.getUrl('multiple-choice', filename))
      .waitFor('.choice-input input', 2000)
      .elements('.choice-input input', function(err, results) {
        for (var i = 0; i < results.value.length; i++) {
          (function(i) {
            browser.elementIdAttribute(results.value[i].ELEMENT, 'value', function(err, res) {
              if (res.value === correctAnswer) {
                browser.elementIdClick(results.value[i].ELEMENT);
              }
            })
          })(i);
        }
      })
      .execute('window.submit()')
      .isVisible('.choice-holder.incorrect', function(err, result) {
        (result === null).should.be.ok;
      })
      .call(done);

  });

  it('displays incorrect feedback when incorrect answer selected', function(done) {

    browser
      .url(Regression.getUrl('multiple-choice', filename))
      .waitFor('.choice-input input', 2000)
      .elements('.choice-input input', function(err, results) {
        for (var i = 0; i < results.value.length; i++) {
          (function(i) {
            browser.elementIdAttribute(results.value[i].ELEMENT, 'value', function(err, res) {
              if (res.value !== correctAnswer) {
                browser.elementIdClick(results.value[i].ELEMENT);
              }
            })
          })(i);
        }
      })
      .execute('window.submit()')
      .isVisible('.choice-holder.incorrect', function(err, result) {
        (result === null).should.not.be.ok;
      })
      .call(done);

  });

});