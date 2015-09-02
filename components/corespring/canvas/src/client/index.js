/* global JXG */

exports.framework = "angular";
exports.service = ['$log',
  function($log) {
    function Canvas(id, attrs) {

      var self = this;

      function createAxis(name, point1, point2) {
        var axisAttrs = {
          ticks: {
            ticksDistance: 0
          },
          strokeColor: "#3d3d3d",
          highlightStrokeColor: "#3d3d3d",
          strokeWidth: 2,
          name: name,
          withLabel: false,
          lastArrow: true,
          firstArrow: true
        };

        return self.board.create('axis', [
          point1,
          point2
        ], axisAttrs);
      }

      function createTicks(axis, ticksDistance, scale, scaleSymbol) {
        var ticksAttrs = {
          drawLabels: true,
          ticksDistance: ticksDistance,
          minorTicks: 0,
          majorHeight: -1,
          strokeColor:'#cccccc',
          scale: scale
        };

        if(scaleSymbol) {
          ticksAttrs.scaleSymbol = ' '+scaleSymbol;
        }

        self.board.create('ticks', [axis, ticksDistance], ticksAttrs);
      }

      var padding = attrs.tickLabelFrequency * attrs.graphPadding / 100;

      this.board = JXG.JSXGraph.initBoard(id, {
        boundingbox: [
          attrs.domainMin - padding,
          attrs.rangeMax + padding,
          attrs.domainMax + padding,
          attrs.rangeMin - padding],
        showNavigation: false,
        showCopyright: false,
        zoom: false
      }, {
        width: attrs.width,
        height: attrs.height
      });

      var domainAxis = createAxis(attrs.domainLabel, [0, 0], [1, 0]);
      var domainTicks = createTicks(domainAxis, attrs.tickLabelFrequency, 1, '');
      var rangeAxis = createAxis(attrs.rangeLabel, [0, 0], [0, 1]);
      var rangeTicks = createTicks(rangeAxis, attrs.tickLabelFrequency, 1, '');

      if (attrs.domainLabel) {
        var xcoords = new JXG.Coords(JXG.COORDS_BY_USER, [attrs.domainMax, 0], this.board);
        var xoffset = new JXG.Coords(JXG.COORDS_BY_SCREEN, [xcoords.scrCoords[1] - ((attrs.domainLabel.length * 4) + 10), xcoords.scrCoords[2] + 10], this.board);
        this.board.create('text', [xoffset.usrCoords[1], xoffset.usrCoords[2], attrs.domainLabel], {
          fixed: true
        });
      }
      if (attrs.rangeLabel) {
        var ycoords = new JXG.Coords(JXG.COORDS_BY_USER, [0, attrs.rangeMax], this.board);
        var yoffset = new JXG.Coords(JXG.COORDS_BY_SCREEN, [ycoords.scrCoords[1] - ((attrs.rangeLabel.length * 4) + 15), ycoords.scrCoords[2] + 10], this.board);
        this.board.create('text', [yoffset.usrCoords[1], yoffset.usrCoords[2], attrs.rangeLabel], {
          fixed: true
        });
      }
      this.points = [];
      this.texts = [];
      this.shapes = [];
      this.scale = attrs.scale;
      this.showLabels = attrs.showLabels === "true";
      this.showCoordinates = attrs.showCoordinates === "true";
      this.showPoints = _.isUndefined(attrs.showPoints) ? "true" :
        !(attrs.showPoints === 'false' || attrs.showPoints === false);
      if (attrs.pointLabels) {
        this.pointLabels = attrs.pointLabels;
      } else {
        this.pointLabels = 'none';
      }
    }

    Canvas.prototype.getMouseCoords = function(e) {
      var cPos = this.board.getCoordsTopLeftCorner(e),
        absPos = JXG.getPosition(e),
        dx = absPos[0] - cPos[0],
        dy = absPos[1] - cPos[1];
      var coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], this.board);
      var simpleCoords = {
        x: coords.usrCoords[1],
        y: coords.usrCoords[2]
      };
      return simpleCoords;
    };
    Canvas.prototype.getPoint = function(ptName) {
      return _.find(this.points, function(p) {
        return p.name === ptName;
      });
    };

    Canvas.prototype.pointCollision = function(coords) {
      var points = this.points,
        scale = this.scale;

      function min(coord) {
        return coord - scale;
      }

      function max(coord) {
        return coord + scale;
      }

      for (var i = 0; i < points.length; i++) {
        var point = points[i];
        //find area where coords might land that would constitute collision with point
        if (point.X() >= min(coords.x) && point.X() <= max(coords.x) && point.Y() >= min(coords.y) && point.Y() <= max(coords.y)) {
          return point;
        }
      }
      return null;
    };

    Canvas.prototype.addPoint = function(coords, ptName, ptOptions) {
      var pointAttrs = _.defaults({
        strokeColor: this.showPoints ? "blue" : "transparent",
        fillColor: this.showPoints ? "blue" : "transparent",
        snapToGrid: true,
        snapSizeX: this.scale,
        snapSizeY: this.scale,
        showInfobox: false,
        withLabel: false
      }, ptOptions);
      var point = this.board.create('point', [coords.x, coords.y], pointAttrs);
      point.canvasIndex = this.points.length;
      this.points.push(point);
      if (this.showLabels) {
        var name = (function(labels, points) {
          if (ptName) {
            return ptName;
          } else if (typeof labels === "string") {
            if (labels === "numbers") {
              return points.length + ".";
            } else if (labels === "letters") {
              return point.name;
            } else if (labels === "none") {
              return "";
            } else {
              var labelsArray = labels.split(",");
              return points.length <= labelsArray.length ? labelsArray[points.length - 1] : "";
            }
          }
        })(this.pointLabels, this.points);
        //in order to get correct offset for text, we must find origin point and offset by screen coordinates,
        //then apply the offset to the point coordinates to get the correct position of text
        var origin = new JXG.Coords(JXG.COORDS_BY_USER, [0, 0], this.board);
        var offset = new JXG.Coords(JXG.COORDS_BY_SCREEN, [origin.scrCoords[1] - 22, origin.scrCoords[2] - 15], this.board);
        var that = this;
        var text = this.board.create('text', [
          function() {
            return point.X() + offset.usrCoords[1];
          },
          function() {
            return point.Y() + offset.usrCoords[2];
          },
          function() {
            return name + (that.showCoordinates ? (' (' + point.X() + ',' + point.Y() + ')') : '');
          }], {
          fixed: true
        });
        this.texts.push(text);
      }
      return point;
    };

    Canvas.prototype.popPoint = function() {
      this.board.removeObject(this.texts.splice(0, 1));
      this.board.removeObject(this.points.splice(0, 1));
    };

    Canvas.prototype.removePoint = function(pointId) {
      for (var i = 0; i < this.points.length; i++) {
        if (this.points[i].id === pointId) {
          this.board.removeObject(this.points[i].text);
          this.board.removeObject(this.points[i]);
          this.points.splice(i, 1);
        }
      }
    };

    Canvas.prototype.on = function(event, handler) {
      return this.board.on(event, handler);
    };

    Canvas.prototype.makeLine = function(pts) {
      var shape = this.board.create('line', pts, {
        strokeColor: '#0000ff',
        strokeWidth: 2,
        fixed: true
      });
      this.shapes.push(shape);
      return shape;
    };

    Canvas.prototype.makeCurve = function(fn) {
      var shape = this.board.create('functiongraph', [fn], {
        strokeColor: '#0000ff',
        strokeWidth: 2,
        fixed: true
      });
      this.shapes.push(shape);
      return shape;
    };

    Canvas.prototype.popShape = function() {
      return this.board.removeObject(this.shapes.splice(0, 1));
    };

    Canvas.prototype.changePointColor = function(point, color) {
      point.setAttribute({
        fillColor: color,
        strokeColor: color
      });
      var index = _.indexOf(_.map(this.points, function(p) {
        return p.id;
      }), point.id);
      if (this.texts[index]) { //check to see if exists as labels may be disabled
        this.texts[index].setAttribute({
          strokeColor: color
        });
      }
    };

    Canvas.prototype.changeShapeColor = function(shape, color) {
      shape.setAttribute({
        strokeColor: color
      });
    };

    return Canvas;
  }
];
