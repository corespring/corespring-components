var assert, component, server, settings, should, _;

//Note: because we are using non conventional requires
//You need to load the component with proxyquire
//And specify any custom dependencies
var proxyquire = require('proxyquire').noCallThru();

server = proxyquire('../../src/server', {'corespring.scoring-utils.server': {}});

assert = require('assert');

should = require('should');

_ = require('lodash');

component = {
};

describe('feedback-block server logic', function () {
});