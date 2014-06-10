describe('corespring line component', function() {

  var logic;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function(LineLogic) {
    logic = LineLogic;
  }));

  it('pointsFromEquation calculation', function() {
    var ob = new logic();
    var result = ob.pointsFromEquation("y=5x+1");
    expect(result[0][0]).toEqual(0);
    expect(result[0][1]).toEqual(1);
    expect(result[1][0]).toEqual(1);
    expect(result[1][1]).toEqual(6);

    result = ob.pointsFromEquation("y=-5x+1");
    expect(result[0][0]).toEqual(0);
    expect(result[0][1]).toEqual(1);
    expect(result[1][0]).toEqual(1);
    expect(result[1][1]).toEqual(-4);

    result = ob.pointsFromEquation("y=-5x-1");
    expect(result[0][0]).toEqual(0);
    expect(result[0][1]).toEqual(-1);
    expect(result[1][0]).toEqual(1);
    expect(result[1][1]).toEqual(-6);

    result = ob.pointsFromEquation("y=-5x");
    expect(result[0][0]).toEqual(0);
    expect(result[0][1]).toEqual(0);
    expect(result[1][0]).toEqual(1);
    expect(result[1][1]).toEqual(-5);

    result = ob.pointsFromEquation("y=5x");
    expect(result[0][0]).toEqual(0);
    expect(result[0][1]).toEqual(0);
    expect(result[1][0]).toEqual(1);
    expect(result[1][1]).toEqual(5);

    result = ob.pointsFromEquation("y=2");
    expect(result[0][0]).toEqual(0);
    expect(result[0][1]).toEqual(2);
    expect(result[1][0]).toEqual(1);
    expect(result[1][1]).toEqual(2);

    result = ob.pointsFromEquation("y=-2");
    expect(result[0][0]).toEqual(0);
    expect(result[0][1]).toEqual(-2);
    expect(result[1][0]).toEqual(1);
    expect(result[1][1]).toEqual(-2);

  });

});