/* global JXG */

exports.framework = "angular";
exports.service = ['$log',
  function($log) {
    function Canvas(id, attrs) {
      var self = this;

      function createAxis(axisProperties, point1, point2, tickProperties) {
        var axisAttrs = {
          ticks: getTicksProperties(axisProperties, tickProperties),
          strokeColor: "#3d3d3d",
          highlightStrokeColor: "#3d3d3d",
          strokeWidth: 2,
          name: axisProperties.label,
          withLabel: false,
          lastArrow: true,
          firstArrow: true
        };

        return self.board.create('axis', [
          point1,
          point2
        ], axisAttrs);
      }

      function getTicksProperties(axisProperties, tickProperties) {
        var defaultValues = {
          insertTicks: true,
          majorHeight: -1,
          minorHeight: -1,
          drawLabels: true,
          minorTicks: axisProperties.labelFrequency - 1,
          label: tickProperties
        };

        if (axisProperties.stepValue) {
          return _.defaults({
            ticksDistance: axisProperties.stepValue * axisProperties.labelFrequency,
            insertTicks: false
          }, defaultValues);
        } else {
          return defaultValues;
        }
      }

      var domainPadding = attrs.domain.stepValue ? attrs.domain.stepValue * attrs.domain.graphPadding / 100 : 0.5;
      var rangePadding = attrs.range.stepValue ? attrs.range.stepValue * attrs.range.graphPadding / 100 : 0.5;

      this.board = JXG.JSXGraph.initBoard(id, {
        boundingbox: [
          attrs.domain.min - domainPadding,
          attrs.range.max + rangePadding,
          attrs.domain.max + domainPadding,
          attrs.range.min - rangePadding],
        showNavigation: false,
        showCopyright: false,
        zoom: false
      }, {
        width: attrs.width,
        height: attrs.height
      });

      var domainAxis = createAxis(attrs.domain, [0, 0], [1, 0], {
            offset: [0,0],
            anchorX: 'middle',
            anchorY: 'top'
          });
      var rangeAxis = createAxis(attrs.range, [0, 0], [0, 1], {
            offset: [-5,0],
            anchorX: 'right',
            anchorY: 'middle'
          });

      this.points = [];
      this.texts = [];
      this.shapes = [];
      this.domainScale = attrs.domain.stepValue * attrs.domain.snapValue;
      this.rangeScale = attrs.range.stepValue * attrs.range.snapValue;
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
        xScale = this.domainScale,
        yScale = this.rangeScale;

      function min(coord, scale) {
        return coord - (scale / 2);
      }

      function max(coord, scale) {
        return coord + (scale / 2);
      }

      for (var i = 0; i < points.length; i++) {
        var point = points[i];
        //find area where coords might land that would constitute collision with point
        if (point.X() >= min(coords.x, xScale) && point.X() <= max(coords.x, xScale) && point.Y() >= min(coords.y, yScale) && point.Y() <= max(coords.y, yScale)) {
          return point;
        }
      }
      return null;
    };

    Canvas.prototype.addPoint = function(coords, ptName, ptOptions) {
      var pointAttrs = _.extend({
        strokeColor: "blue",
        fillColor: "blue",
        snapToGrid: true,
        snapSizeX: this.domainScale,
        snapSizeY: this.rangeScale,
        showInfobox: false,
        withLabel: false,
        size: 3,
        visible: this.showPoints
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
            return (Math.round(point.X() * 100) / 100) + offset.usrCoords[1];
          },
          function() {
            return (Math.round(point.Y() * 100) / 100) + offset.usrCoords[2];
          },
          function() {
            return name + (that.showCoordinates ? (' (' + (Math.round(point.X() * 100) / 100) + ',' + (Math.round(point.Y() * 100) / 100) + ')') : '');
          }], {
          fixed: true
        });
        this.texts.push(text);
        point.text = text;
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

    Canvas.prototype.removePointByName = function(pointName) {
      for (var i = 0; i < this.points.length; i++) {
        if (this.points[i].name === pointName) {
          this.board.removeObject(this.points[i].text);
          this.board.removeObject(this.points[i]);
          this.points.splice(i, 1);
        }
      }
    };

    Canvas.prototype.on = function(event, handler) {
      return this.board.on(event, handler);
    };

    Canvas.prototype.makeLine = function(pts, options) {
      var shapeArgs = {
        strokeColor: options.color ? options.color : '#0000ff',
        highlightStrokeColor: '#9C9C9C',
        strokeWidth: 3,
        fixed: true,
        firstArrow: true,
        lastArrow: true,
        withLabel: options.label,
        name: options.label
      };

      var shape = this.board.create('line', pts, shapeArgs);
      shape.customId = options.id;
      this.shapes.push(shape);
      return shape;
    };

    Canvas.prototype.makeCurve = function(fn) {
      var shape = this.board.create('functiongraph', [fn], {
        strokeColor: '#0000ff',
        strokeWidth: 3,
        fixed: true
      });
      this.shapes.push(shape);
      return shape;
    };

    Canvas.prototype.popShape = function() {
      return this.board.removeObject(this.shapes.splice(this.shapes.length - 1, 1));
    };

    Canvas.prototype.removeShapeByCustomId = function(customId) {
      for (var i = 0; i < this.shapes.length; i++) {
        if (this.shapes[i].customId === customId) {
          return this.board.removeObject(this.shapes.splice(i, 1));
        }
      }
    };

    Canvas.prototype.changePointColor = function(point, color, symbol) {
      point.setAttribute({
        fillColor: color,
        strokeColor: color
      });
      if(symbol) {
        point.setAttribute({
          face: symbol,
          size: (symbol === 'square' || symbol === 'circle') ? 3 : 5
        });
      }
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

    Canvas.prototype.getPointCoords = function(point1, point2) {
      var coords = new JXG.Coords(JXG.COORDS_BY_USER, [point1, point2], this.board);
      return {
        x: coords.scrCoords[1],
        y: coords.scrCoords[2]
      };
    };

    return Canvas;
  }
];
