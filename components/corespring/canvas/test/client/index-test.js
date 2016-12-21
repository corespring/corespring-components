describe('corespring:canvas:index', function() {

  var scope, canvas, element;

  var topLeftCorner = [0,0];
  var JXG = {
    JSXGraph: {
      initBoard: function() {
        return {
          currentId: 1,
          create: function(elementType, parents, attributes) {
            if(elementType === 'point'){
              return {
                id: this.currentId,
                name: String.fromCharCode(64 + this.currentId++)
              };
            }
            return {};
          },
          removeObject: function() {},
          on: function() {},
          getCoordsTopLeftCorner: function(event) {
            return topLeftCorner;
          }
        };
      }
    },
    getPosition: function(event) {
      return [event.x, event.y];
    },
    Coords: function(config, deltas) {
      return {scrCoords: [1,deltas[0],deltas[1]], usrCoords: [1,deltas[0],deltas[1]]};
    }
  };

  beforeEach(module(function($provide) {
    $provide.value('JXG', JXG);
    window.JXG = JXG;
  }));

  var getCanvasAttributes = function() {
    return {
      domain: {
        label: "Domain",
        min: -10,
        max: 10,
        stepValue: 1,
        snapValue: 1,
        labelFrequency: 1,
        graphPadding: 50
      },
      range: {
        label: "Range",
        min: -10,
        max: 10,
        stepValue: 1,
        snapValue: 1,
        labelFrequency: 1,
        graphPadding: 50
      },
      maxPoints: 2,
      pointLabels: [],
      graphTitle: "Graph tiel",
      width: 500,
      height: 500,
      showLabels: true,
      showCoordinates: true,
      showPoints: true,
      showAxisLabels: true
    };
  };

  beforeEach(angular.mock.module('test-app'));

  beforeEach(inject(function($compile, $rootScope, Canvas) {
    element = $compile("<div id='canvas' class='jxgbox' ng-style='boxStyle' style='width: 500px; height: 500px'></div>");
    scope = $rootScope.$new();
    canvas = new Canvas('canvas', getCanvasAttributes());
    canvas.reset();
    scope.$digest();
  }));

  afterEach(function() {

  });

  it('should be defined', function() {
    expect(canvas).toBeDefined();
    expect(canvas.board).toBeDefined();
  });

  describe('addPoint', function() {

    it('should create a point and add it to the array', function() {
      canvas.addPoint({x: 0, y: 0}, 'A');
      canvas.addPoint({x: 1, y: 1}, 'B');
      expect(canvas.points.length).toBe(2);
    });

    it('should add a label if showLabels is true', function() {
      canvas.showLabels = true;
      canvas.addPoint({x: 0, y: 0});
      expect(canvas.points[0].text).toBeDefined();
    });

    it('should not add a label if showLabels is false', function() {
      canvas.showLabels = false;
      canvas.addPoint({x: 0, y: 0});
      expect(canvas.points[0].text).not.toBeDefined();
    });

  });

  describe('removePoint / popPoint', function() {

    it('should pop last point', function() {
      canvas.addPoint({x: 0, y: 0});
      canvas.addPoint({x: 1, y: 1});
      canvas.popPoint();
      expect(canvas.points.length).toBe(1);
    });

    it('should remove point by id', function() {
      var point1 = canvas.addPoint({x: 0, y: 0});
      var point2 = canvas.addPoint({x: 1, y: 1});
      var point3 = canvas.addPoint({x: 2, y: 2});
      canvas.removePoint(point2.id);

      expect(canvas.points.length).toBe(2);
      expect(canvas.getPoint(point2.name)).not.toBeDefined();
    });

    it('should remove point by name', function() {
      var point1 = canvas.addPoint({x: 0, y: 0});
      var point2 = canvas.addPoint({x: 1, y: 1});
      var point3 = canvas.addPoint({x: 2, y: 2});
      canvas.removePointByName(point2.name);

      expect(canvas.points.length).toBe(2);
      expect(canvas.getPoint(point2.name)).not.toBeDefined();
    });

  });

  describe('add shapes', function() {

    it('should create a line, set the customId and add it to the array', function() {
      var line = canvas.makeLine([], { id: 'custom_id' });
      expect(canvas.shapes.length).toBe(1);
      expect(line.customId).toBe('custom_id');
    });

    it('should create a curve, set the customId and add it to the array', function() {
      var curve = canvas.makeCurve(function(){}, { id: 'custom_id' });
      expect(canvas.shapes.length).toBe(1);
      expect(curve.customId).toBe('custom_id');
    });

  });

  describe('remove shapes', function() {

    it('should pop last shape', function() {
      var line1 = canvas.makeLine([], { id: '1' });
      var line2 = canvas.makeLine([], { id: '2' });
      var line3 = canvas.makeLine([], { id: '3' });
      canvas.popShape();

      expect(canvas.shapes.length).toBe(2);
      expect(canvas.getShape(line3.customId)).not.toBeDefined();
    });

    it('should remove shape by custom id', function() {
      var line1 = canvas.makeLine([], { id: '1' });
      var line2 = canvas.makeLine([], { id: '2' });
      var line3 = canvas.makeLine([], { id: '3' });
      canvas.removeShapeByCustomId(line2.customId);

      expect(canvas.shapes.length).toBe(2);
      expect(canvas.getShape(line2.customId)).not.toBeDefined();
    });

  });

  describe('getPointCoords', function() {

    it('should return an object with x and y defined', function() {
      var coords = canvas.getPointCoords('', '');
      expect(coords.x).toBeDefined();
      expect(coords.y).toBeDefined();
    });

  });

  describe('getMouseCoords', function() {
    var x = 100;
    var y = 200;

    describe('touchEvent', function() {
      var event = {
        changedTouches: [{
          pageX: x,
          pageY: y
        }]
      };
      var nonTouchEvent = {};

      it('should return x and y coordinates and nothing for non-touch afterward', function() {
        var result = canvas.getMouseCoords(event);
        expect(result).toEqual({
          x: x, y: y
        });
        var nontouchResult = canvas.getMouseCoords(nonTouchEvent);
        expect(nontouchResult).toBe(undefined);
      });

    });


    describe('non-touch event', function() {
      var nonTouchEvent = {x: 123, y: 456};
      it('should return result from getPosition', function() {
        var result = canvas.getMouseCoords(nonTouchEvent);
        expect(result).toEqual(nonTouchEvent);
      });
    });

  });

});
