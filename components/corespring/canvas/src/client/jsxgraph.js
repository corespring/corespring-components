exports.framework = "angular";

exports.directive = {
  name: "jsxGraph",
  directive: ['Canvas', jsxGraphDirective]
};


function jsxGraphDirective(Canvas) {
  return {
    template: "<div class='jxgbox' ng-style='boxStyle' style='width: 100%; height: 100%'></div>",
    restrict: 'A',
    scope: {
      interactionCallback: '=',
      graphCallback: '=',
      hoveredLine: '='
    },
    link: link
  };

  function link(scope, elem, attr) {
    var lockGraph = false;
    var points = {};

    // initialize canvas
    var canvasAttrs = getCanvasAttributes();
    var canvas = new Canvas(generateCanvasId(), canvasAttrs);
    setGraphLabels(canvas, canvasAttrs);

    // define canvas callbacks
    canvas.on('up', onCanvasUp);
    scope.graphCallback = graphCallback;

    //-----------------------------------------------
    //only functions below
    //-----------------------------------------------

    function getCanvasAttributes() {
      return {
        domain: {
          label: attr.domainlabel,
          min: parseFloat(attr.domainmin ? attr.domainmin : -10, 10),
          max: parseFloat(attr.domainmax ? attr.domainmax : 10, 10),
          stepValue: parseFloat(attr.domainstepvalue ? attr.domainstepvalue : 1),
          snapValue: parseFloat(attr.domainsnapvalue ? attr.domainsnapvalue : 1),
          labelFrequency: attr.domainlabelfrequency,
          graphPadding: parseInt(attr.domaingraphpadding ? attr.domaingraphpadding : 50, 10)
        },
        range: {
          label: attr.rangelabel,
          min: parseFloat(attr.rangemin ? attr.rangemin : -10, 10),
          max: parseFloat(attr.rangemax ? attr.rangemax : 10, 10),
          stepValue: parseFloat(attr.rangestepvalue ? attr.rangestepvalue : 1),
          snapValue: parseFloat(attr.rangesnapvalue ? attr.rangesnapvalue : 1),
          labelFrequency: attr.rangelabelfrequency,
          graphPadding: parseInt(attr.rangegraphpadding ? attr.rangegraphpadding : 50, 10)
        },
        maxPoints: parseInt(attr.maxpoints ? attr.maxpoints : null, 10),
        pointLabels: attr.pointlabels,
        graphTitle: attr.graphtitle,
        width: elem.width(),
        height: elem.height(),
        showLabels: parseBool(attr.showlabels, true),
        showCoordinates: parseBool(attr.showcoordinates, true),
        showPointLabels: parseBool(attr.showpointlabels, true),
        showPoints: parseBool(attr.showpoints, true),
        showAxisLabels: parseBool(attr.showaxislabels, true)
      };
    }

    function parseBool(value, defaultValue) {
      return _.isUndefined(value) || _.isEmpty(value) ? defaultValue : String(value).toLowerCase() === 'true';
    }

    function generateCanvasId() {
      var canvasId = Math.random().toString(36).substring(7);
      elem.find(".jxgbox").attr("id", canvasId);
      return canvasId;
    }

    // add x and y axis outside the graph
    function setGraphLabels(canvas, canvasAttrs) {
      var jxgbox = elem.find(".jxgbox");
      var coords = canvas.getPointCoords(0, 0);
      var graphVCenter = elem.height() / 2;
      var graphHCenter = elem.width() / 2;
      var offset = 0;

      if (!_.isUndefined(canvasAttrs.graphTitle) && !_.isEmpty(canvasAttrs.graphTitle)) {
        jxgbox.before('<div class="graph-label graph-title">' + canvasAttrs.graphTitle + '</div>');
        var graphTitle = elem.find('.graph-title');
        graphTitle.css("left", graphHCenter - (graphTitle.width() / 2));
      }

      jxgbox.before('<div class="graph-label domain-label">' + canvasAttrs.domain.label + '</div>');
      jxgbox.after('<div class="graph-label range-label">' + canvasAttrs.range.label + '</div>');

      // domain label
      var domainLabel = elem.find('.domain-label');
      domainLabel.css("left", graphHCenter - (domainLabel.width() / 2));

      // range label
      var rangeLabel = elem.find('.range-label');
      rangeLabel.css("left", -(rangeLabel.width() / 2) - rangeLabel.height() / 2);
      rangeLabel.css("top", graphVCenter - rangeLabel.height() / 2);

      if (canvasAttrs.showAxisLabels === true || canvasAttrs.showAxisLabels === 'true') {

        // domain axis label
        jxgbox.after('<div class="graph-label domain-axis-label">x</div>');
        var domainAxisLabel = elem.find('.domain-axis-label');
        var domainAxisLabelHeight = domainAxisLabel.height();
        domainAxisLabel.css("right", 0 - domainAxisLabel.width());

        if (coords.y <= graphVCenter) {
          offset = coords.y - domainAxisLabelHeight / 2;
          domainAxisLabel.css("top", offset < domainAxisLabelHeight / 2 ? domainAxisLabelHeight / 2 : offset);
        } else {
          offset = elem.height() - coords.y - domainAxisLabel.height() / 2;
          domainAxisLabel.css("bottom", offset < domainAxisLabelHeight / 2 ? domainAxisLabelHeight / 2 : offset);
        }

        // range axis label
        jxgbox.before('<div class="graph-label range-axis-label">y</div>');
        var rangeAxisLabel = elem.find('.range-axis-label');
        var rangeAxisLabelWidth = rangeAxisLabel.width();

        if (coords.x <= graphHCenter) {
          offset = coords.x - (rangeAxisLabelWidth / 2);
          rangeAxisLabel.css("left", offset < 0 ? 0 : offset);
        } else {
          offset = (canvasAttrs.width - coords.x) - (rangeAxisLabelWidth / 2);
          rangeAxisLabel.css("right", offset < 0 ? 0 : offset);
        }
      }
    }

    function addCanvasPoint(coords, ptName, ptOptions) {
      var point = canvas.addPoint(coords, ptName, ptOptions);
      point.on('up', function(e) {
        onPointMove(point);
        return false;
      });
      return point;
    }

    function addPoint(coords, ptName, ptOptions) {
      var point = addCanvasPoint(coords, ptName, ptOptions);
      points[point.name] = getPointData(point);
      return getPointData(point);
    }

    function addUserPoint(coords, ptName, ptOptions) {
      var point = addCanvasPoint(coords, ptName, ptOptions);
      onPointMove(point);
      return point;
    }

    function onPointMove(point, coords) {
      if (coords) {
        point.moveTo([coords.x, coords.y]);
      }

      var movedPoint = getPointData(point);
      points[point.name] = movedPoint;

      scope.interactionCallback({
        points: points,
        point: movedPoint
      });
    }

    function getPointData(point) {
      return {
        index: point.canvasIndex,
        name: point.name,
        x: (Math.round(point.X() * 100) / 100),
        y: (Math.round(point.Y() * 100) / 100)
      };
    }

    function clearBoard() {
      while (canvas.points.length > 0) {
        canvas.popPoint();
      }
      while (canvas.shapes.length > 0) {
        canvas.popShape();
      }
      points = {};
    }

    function drawShapeCallback(drawShape) {
      var shape;

      if (drawShape.line) {
        var pt1 = canvas.getPoint(drawShape.line[0]);
        var pt2 = canvas.getPoint(drawShape.line[1]);
        if (pt1 && pt2) {
          shape = canvas.makeLine([pt1, pt2], {
            id: drawShape.id,
            label: drawShape.label,
            color: drawShape.color
          });
        }
      } else if (drawShape.curve) {
        shape = canvas.makeCurve(drawShape.curve, {
          id: drawShape.id,
          label: drawShape.label,
          color: drawShape.color
        });
      }

      if (!_.isUndefined(scope.hoveredLine)) {
        shape.on('over', function() {
          scope.hoveredLine = this.customId;
        });
        shape.on('out', function() {
          scope.hoveredLine = -1;
        });
      }
    }

    function addCallback(add) {
      if (add.point) {
        var options = {};
        if (add.color) {
          options.strokeColor = add.color;
          options.fillColor = add.color;
        }
        if (add.name) {
          options.name = add.name;
        }

        if (add.triggerCallback) {
          return getPointData(addUserPoint(add.point, undefined, options));
        } else {
          return addPoint(add.point, undefined, options);
        }
      }
    }

    function updateCallback(update) {
      if (update.point) {
        canvas.getPoint(update.point.name).moveTo([update.point.x, update.point.y]);
      }
    }

    function removeCallback(remove) {
      if (remove.line) {
        canvas.removeShapeByCustomId(remove.line);
      }
      if (remove.points) {
        _.each(remove.points, function(point) {
          canvas.removePointByName(point.name);
        });
      } else if (remove.point) {
        canvas.removePointByName(remove.point.name);
      }
    }

    function pointColorCallback(pointColor) {
      if (pointColor.points) {
        _.each(pointColor.points, function(point) {
          canvas.changePointColor(canvas.getPoint(point), pointColor.color, pointColor.symbol);
        });
      } else if (pointColor.point) {
        canvas.changePointColor(canvas.getPoint(pointColor.point), pointColor.color, pointColor.symbol);
      }
    }

    function shapeColorCallback(shapeColor) {
      if (shapeColor.shape) {
        var shape = canvas.getShape(shapeColor.shape);
        if (shape) {
          canvas.changeShapeColor(shape, shapeColor.color);
          if (shape.point1) {
            canvas.changePointColor(shape.point1, shapeColor.color);
          }
          if (shape.point2) {
            canvas.changePointColor(shape.point2, shapeColor.color);
          }
        }
      }
    }

    function onCanvasUp(e) {
      if (lockGraph) {
        return;
      }
      var coords = canvas.getMouseCoords(e);
      if (coords && (!canvasAttrs.maxPoints || canvas.points.length < canvasAttrs.maxPoints) && !canvas.pointCollision(coords)) {
        addUserPoint(coords);
      }
    }

    function graphCallback(params) {
      if (params.add && canvas) {
        return addCallback(params.add);
      }
      if (params.update && canvas) {
        updateCallback(params.update);
      }
      if (params.remove && canvas) {
        removeCallback(params.remove);
      }

      if (params.points && canvas) {
        processPointsCallback(params.points);
      }
      if (params.drawShape && canvas) {
        drawShapeCallback(params.drawShape);
      }
      if (params.pointColor && canvas) {
        pointColorCallback(params.pointColor);
      }
      if (params.shapeColor && canvas) {
        shapeColorCallback(params.shapeColor);
      }

      if (params.clearBoard && canvas) {
        clearBoard();
        scope.boxStyle = {
          width: "100%",
          height: "100%"
        };
        lockGraph = false;
      }
      if (params.pointsStyle && canvas) {
        if (Array.isArray(params.pointsStyle)) {
          _.each(_.zip(canvas.points, params.pointsStyle), function(pair) {
            var point = pair[0];
            var style = pair[1];
            canvas.changePointColor(point, style);
          });
        } else {
          _.each(canvas.points, function(p) {
            canvas.changePointColor(p, params.pointsStyle);
          });
        }
      }
      if (params.graphStyle) {
        scope.boxStyle = _.extend({
          width: "100%",
          height: "100%"
        }, params.graphStyle);
      }
      if (params.shapesStyle && canvas) {
        _.each(canvas.shapes, function(shape) {
          canvas.changeShapeColor(shape, params.shapesStyle);
        });
      }
      if (params.lockGraph && canvas) {
        _.each(canvas.points, function(p) {
          p.setAttribute({
            fixed: true
          });
        });
        lockGraph = true;
      }
      if (params.unlockGraph && canvas) {
        _.each(canvas.points, function(p) {
          p.setAttribute({
            fixed: false
          });
        });
        lockGraph = false;
      }
    }

    // still used on single line, plot point components
    function processPointsCallback(paramPoints) {
      var i, coordx, coordy, coords, canvasPoint, point;

      if (!lockGraph) {
        clearBoard();
      }

      if (_.isArray(paramPoints)) {
        for (i = 0; i < paramPoints.length; i++) {
          point = paramPoints[i];
          coordx = parseFloat(point.x);
          coordy = parseFloat(point.y);
          if (!isNaN(coordx) && !isNaN(coordy)) {
            coords = {
              x: coordx,
              y: coordy
            };
            canvasPoint = canvas.pointCollision(coords);
            if (canvasPoint === null) {
              canvasPoint = addPoint(coords);
            }
          }
          if (point.color) {
            canvas.changePointColor(canvasPoint, paramPoints[i].color);
          }
        }
      } else if (_.isObject(paramPoints)) {
        for (var ptName in paramPoints) {
          point = paramPoints[ptName];
          coordx = parseFloat(point.x);
          coordy = parseFloat(point.y);
          if (!isNaN(coordx) && !isNaN(coordy)) {
            coords = {
              x: coordx,
              y: coordy
            };
            canvasPoint = null;
            for (i = 0; i < canvas.points.length; i++) {
              if (ptName === canvas.points[i].name) {
                canvasPoint = canvas.points[i];
              }
            }
            //if the coordinates for a point that exists has changed, then update that point
            //otherwise, a new point will be created
            if (canvasPoint !== null) {
              if (canvasPoint.X() !== coords.x || canvasPoint.Y() !== coords.y) {
                onPointMove(canvasPoint, coords);
              }
            } else if (!canvasAttrs.maxPoints || canvas.points.length < canvasAttrs.maxPoints) {
              canvasPoint = addPoint(coords, undefined, {
                fixed: lockGraph
              });
            }
            if (point.color) {
              canvas.changePointColor(canvasPoint, point.color);
            }
          }
        }
      }
    }
  }
}