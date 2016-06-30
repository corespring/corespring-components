var expect, server;

server = require('../../src/server');
expect = require('expect');

describe('audio server logic', function() {
  describe('isScoreable', function() {
    it('should return false', function() {
      expect(server.isScoreable()).toBe(false);
    });
  });
});