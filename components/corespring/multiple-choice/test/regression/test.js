'use strict';

var express = require('express');
var should = require('should');

describe('multiple-choice', function() {

  beforeEach(function() {
    var app = express();

    app.use(express.static(__dirname + '/../../src/client'));

    app.listen(3000);

  })

  it('displays correct feedback when answered', function(done) {

    browser
      .url('http://localhost:3000/render.js')
      .getText('body', function(error, body) {
        console.log(body);
      })
      .call(done);

  });

});