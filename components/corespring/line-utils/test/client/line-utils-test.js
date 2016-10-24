describe('corespring line component', function() {

  var utilsFactory, utilsInstance;

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function(LineUtils) {
    utilsFactory = LineUtils;
    utilsInstance = new LineUtils();
  }));

  describe('isValidFormula', function() {
    it('linear equation is valid', function() {
      expect(utilsInstance.isValidFormula('2x+3')).toEqual(true);
    });
    it('linear equation with - is valid', function() {
      expect(utilsInstance.isValidFormula('2x-3')).toEqual(true);
    });
    it('linear equation with y= prefix is valid', function() {
      expect(utilsInstance.isValidFormula('y=2x+3')).toEqual(true);
    });
    it('linear equation with x+b form is valid', function() {
      expect(utilsInstance.isValidFormula('y=x+3')).toEqual(true);
    });
    it('linear equation with mx+-b form is valid', function() {
      expect(utilsInstance.isValidFormula('y=3x+-3')).toEqual(true);
    });
    it('linear equation with decimals is valid', function() {
      expect(utilsInstance.isValidFormula('y=2.123x+3333.12')).toEqual(true);
    });
    it('linear equation without b is valid', function() {
      expect(utilsInstance.isValidFormula('y=2.123x')).toEqual(true);
    });
    it('linear equation without mx is valid', function() {
      expect(utilsInstance.isValidFormula('y=2.123')).toEqual(true);
    });
    it('linear equation with capital X is valid', function() {
      expect(utilsInstance.isValidFormula('y=2X+3')).toEqual(true);
    });
    it('linear equation with other letter than x is invalid', function() {
      expect(utilsInstance.isValidFormula('y=2a+3')).toEqual(false);
    });
    it('linear equation with no x is invalid', function() {
      expect(utilsInstance.isValidFormula('y=2+3')).toEqual(false);
    });
    it('linear equation with more than 2 parts is invalid', function() {
      expect(utilsInstance.isValidFormula('y=2x+3+2')).toEqual(false);
    });

  });

  it('pointsFromEquation calculation', function() {
    var ob = new utilsFactory();

    var result = ob.pointsFromEquation("y");
    expect(result).not.toBeDefined();

    result = ob.pointsFromEquation("y=");
    expect(result).not.toBeDefined();

    result = ob.pointsFromEquation("y=x");
    expect(result).toEqual([
      [0, 0],
      [1, 1]
    ]);

    result = ob.pointsFromEquation("y=5x+1");
    expect(result).toEqual([
      [0, 1],
      [1, 6]
    ]);

    result = ob.pointsFromEquation("y=-5x+1");
    expect(result).toEqual([
      [0, 1],
      [1, -4]
    ]);

    result = ob.pointsFromEquation("y=-5x-1");
    expect(result).toEqual([
      [0, -1],
      [1, -6]
    ]);

    result = ob.pointsFromEquation("y=-5x");
    expect(result).toEqual([
      [0, 0],
      [1, -5]
    ]);

    result = ob.pointsFromEquation("y=5x");
    expect(result).toEqual([
      [0, 0],
      [1, 5]
    ]);

    result = ob.pointsFromEquation("y=2");
    expect(result).toEqual([
      [0, 2],
      [1, 2]
    ]);

    result = ob.pointsFromEquation("y=-2");
    expect(result).toEqual([
      [0, -2],
      [1, -2]
    ]);

    result = ob.pointsFromEquation("y=1/2", {domainSnapValue: 1, rangeSnapValue: 0.5});
    expect(result).toEqual([
      [0, 0.5],
      [1, 0.5]
    ]);

    result = ob.pointsFromEquation("y=1/2x", {domainSnapValue: 0.5, rangeSnapValue: 0.5});
    expect(result).toEqual([
      [0, 0],
      [1, 0.5]
    ]);

    result = ob.pointsFromEquation("y=-1/2x", {domainSnapValue: 0.5, rangeSnapValue: 0.5});
    expect(result).toEqual([
      [0, 0],
      [1, -0.5]
    ]);

    result = ob.pointsFromEquation("y=-1/2x+1", {domainSnapValue: 0.5, rangeSnapValue: 0.5});
    expect(result).toEqual([
      [0, 1],
      [1, 0.5]
    ]);

    result = ob.pointsFromEquation("y=1-1/2x", {domainSnapValue: 0.5, rangeSnapValue: 0.5});
    expect(result).toEqual([
      [0, 1],
      [1, 0.5]
    ]);

    result = ob.pointsFromEquation("y=1x+-2");
    expect(result).toEqual([
      [0, -2],
      [1, -1]
    ]);
  });

});
