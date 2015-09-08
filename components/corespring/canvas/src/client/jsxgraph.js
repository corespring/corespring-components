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
          graphPadding: parseInt(attr.graphpadding ? attr.graphpadding : 25, 10),
          domainMin: parseInt(attr.domainmin ? attr.domainmin : -10, 10),
          domainMax: parseInt(attr.domainmax ? attr.domainmax : 10, 10),
          domainStepValue: parseFloat(attr.domainstepvalue ? attr.domainstepvalue : 1),
          domainLabelPattern: attr.domainlabelpattern,
          rangeMin: parseInt(attr.rangemin ? attr.rangemin : -10, 10),
          rangeMax: parseInt(attr.rangemax ? attr.rangemax : 10, 10),
          rangeStepValue: parseFloat(attr.rangestepvalue ? attr.rangestepvalue : 1),
          rangeLabelPattern: attr.rangelabelpattern,
          scale: parseFloat(attr.scale ? attr.scale : 1, 10),
          maxPoints: parseInt(attr.maxpoints ? attr.maxpoints : null, 10),
          domainLabel: attr.domainlabel,
          rangeLabel: attr.rangelabel,
          tickLabelFrequency: parseInt(attr.ticklabelfrequency ? attr.ticklabelfrequency : 1, 10),
          pointLabels: attr.pointlabels,
          width: elem.width(),
          height: elem.height(),
          showLabels: attr.showlabels,
          showCoordinates: attr.showcoordinates,
          showPoints: attr.showpoints
        };

        function setCanvasProperties() {
          var canvasId = Math.random().toString(36).substring(7);
          var jxgbox = elem.find(".jxgbox");
          var offsetLeft = elem.width() / 2 + 10;
          var offsetTop = elem.height() / 2 + 10;
          jxgbox.attr("id", canvasId);
          jxgbox.before('<div class="axis">'+attr.rangelabel+'</div>');
          jxgbox.after('<div class="axis domain" style="left: '+offsetLeft+'px; top: -'+offsetTop+'px;">'+attr.domainlabel+'</div>');

          return canvasId;
        }

        var canvas = new Canvas(setCanvasProperties(), canvasAttrs);

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
          scope.interactionCallback({
            points: points
          });
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
