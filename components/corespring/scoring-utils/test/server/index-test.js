//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire =  require('proxyquire').noCallThru();

var server = proxyquire('../../src/server', {});

var assert = require('assert');

var should = require('should');

var _ = require('lodash');


describe('multiple-choice server logic', function() {

  describe('respond', function() {

    it('should not show any feedback', function() {
      server.ping("hello").should.equal("You said: hello");
    });
  });
});
