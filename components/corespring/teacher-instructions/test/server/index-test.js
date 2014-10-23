var proxyquire = require('proxyquire').noCallThru();
var fbu = require('../../../server-shared/src/server/feedback-utils');
var server = proxyquire('../../src/server', {
  'corespring.server-shared.server.feedback-utils': fbu
});

var component = {
  "componentType" : "corespring-teacher-instructions",
  "value" : "This is text that should be removed by preprocessing!"
};

describe('teacher-instructions server logic', function() {
  it('should not return the value', function() {
    var json = server.preprocess(component);
    (typeof json.value).should.eql('undefined');
  });
});