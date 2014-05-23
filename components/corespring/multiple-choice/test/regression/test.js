'use strict';

var should = require('should');

describe('multiple-choice', function() {

  it('displays correct feedback when answered', function(done) {

    browser
      .url('http://corespring.org')
      .title(function(err, title) {
        title.value.should.eql('CoreSpring');
      })
      .call(done);

  });

});