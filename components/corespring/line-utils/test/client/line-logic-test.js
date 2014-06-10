describe('corespring line component', function() {

  var logic;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function(LineLogic) {
    logic = LineLogic;
  }));

  it('factory should create', function() {
    var ob = new logic();
    expect(ob.ping()).toEqual('pong');
  });
});