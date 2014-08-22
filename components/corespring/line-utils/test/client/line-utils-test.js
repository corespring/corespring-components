describe('corespring line component', function() {

    var utilsFactory;

    beforeEach(angular.mock.module('test-app'));

    beforeEach(inject(function(LineUtils) {
        utilsFactory = LineUtils;
    }));

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

        result = ob.pointsFromEquation("y=1/2");
        expect(result).toEqual([
            [0, 0.5],
            [1, 0.5]
        ]);

        result = ob.pointsFromEquation("y=1/2x");
        expect(result).toEqual([
            [0, 0],
            [1, 0.5]
        ]);

        result = ob.pointsFromEquation("y=-1/2x");
        expect(result).toEqual([
            [0, 0],
            [1, -0.5]
        ]);

        result = ob.pointsFromEquation("y=-1/2x+1");
        expect(result).toEqual([
            [0, 1],
            [1, 0.5]
        ]);

        result = ob.pointsFromEquation("y=1-1/2x");
        expect(result).toEqual([
            [0, 1],
            [1, 0.5]
        ]);
    });

});
