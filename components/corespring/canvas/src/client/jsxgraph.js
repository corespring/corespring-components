var def = ['Canvas',
  function(Canvas) {
    return {
      template: "<div class='jxgbox' ng-style='boxStyle' style='width: 100%; height: 100%'></div>",
      restrict: 'A',
      scope: {
        interactionCallback: '=',
        graphCallback: '='
      },
      link: function(scope, elem, attr) {
        //global vars
        var canvasAttrs = {
          domain: parseInt(attr.domain ? attr.domain : 10, 10),
          range: parseInt(attr.range ? attr.range : 10, 10),
          scale: parseFloat(attr.scale ? attr.scale : 1, 10),
          maxPoints: parseInt(attr.maxpoints ? attr.maxpoints : null, 10),
          domainLabel: attr.domainlabel,
          rangeLabel: attr.rangelabel,
          tickLabelFrequency: parseInt(attr.ticklabelfrequency ? attr.ticklabelfrequency : 5, 10),
          pointLabels: attr.pointlabels,
          width: elem.width(),
          height: elem.height(),
          showLabels: attr.showlabels,
          showCoordinates: attr.showcoordinates,
          showPoints: attr.showpoints
        };

        function generateCanvasId() {
          var canvasId = Math.random().toString(36).substring(7);
          elem.find(".jxgbox").attr("id", canvasId);
          return canvasId;
        }

        var canvas = new Canvas(generateCanvasId(), canvasAttrs);
        //define callbacks
        canvas.on('up', function(e) {
          if (lockGraph) {
            return;
          }
          var coords = canvas.getMouseCoords(e);
          if ((!canvasAttrs.maxPoints || canvas.points.length < canvasAttrs.maxPoints) && !canvas.pointCollision(coords)) {
            addPoint(coords);
          }
        });
        var lockGraph = false;
        var points = {};
        var onPointMove = function(point, coords) {
          if (coords) {
            point.moveTo([coords.x, coords.y]);
          }
          points[point.name] = {
            x: point.X(),
            y: point.Y(),
            index: point.canvasIndex
          };
          if (!lockGraph) {
            scope.interactionCallback({
              points: points
            });
          }
        };

        var addPoint = function(coords, ptName, ptOptions) {
          var point = canvas.addPoint(coords, ptName, ptOptions);
          point.on('up', function(e) {
            onPointMove(point);
          });
          onPointMove(point);
          return point;
        };

        var clearBoard = function() {
          while (canvas.points.length > 0) {
            canvas.popPoint();
          }
          while (canvas.shapes.length > 0) {
            canvas.popShape();
          }
          points = {};
        };

        function processPointsCallback(paramPoints) {
          var i, coordx, coordy, coords, canvasPoint;
          if (!lockGraph) {
            clearBoard();
          }
          if (_.isObject(paramPoints)) {
            for (var ptName in paramPoints) {
              var point = paramPoints[ptName];
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
                  canvasPoint = addPoint(coords, undefined, {fixed: lockGraph});
                }
                if (point.color) {
                  canvas.changePointColor(canvasPoint, point.color);
                }
              }
            }
          } else if (_.isArray(paramPoints)) {
            for (i = 0; i < paramPoints.length; i++) {
              coordx = parseFloat(paramPoints[i].x);
              coordy = parseFloat(paramPoints[i].y);
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
              if (paramPoints[i].color) {
                canvas.changePointColor(canvasPoint, paramPoints[i].color);
              }
            }
          }
        }

        function drawShapeCallback(drawShape) {
          if (drawShape.line) {
            var pt1 = canvas.getPoint(drawShape.line[0]);
            var pt2 = canvas.getPoint(drawShape.line[1]);
            if (pt1 && pt2) {
              canvas.makeLine([pt1, pt2]);
            }
          } else if (drawShape.curve) {
            canvas.makeCurve(drawShape.curve);
          }
        }

        scope.graphCallback = function(params) {
          if (params.points && canvas) {
            processPointsCallback(params.points);
          }
          if (params.drawShape && canvas) {
            drawShapeCallback(params.drawShape);
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
            _.each(canvas.points, function(p) {
              canvas.changePointColor(p, params.pointsStyle);
            });
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
        };
      }
    };
}];

exports.framework = "angular";
exports.directive = {
  name: "jsxGraph",
  directive: def
};
