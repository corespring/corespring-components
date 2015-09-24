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
          domain: {
            label: attr.domainlabel,
            min: parseFloat(attr.domainmin ? attr.domainmin : -10, 10),
            max: parseFloat(attr.domainmax ? attr.domainmax : 10, 10),
            stepValue: parseFloat(attr.domainstepvalue ? attr.domainstepvalue : 1),
            labelFrequency: attr.domainlabelfrequency,
          },
          range: {
            label: attr.rangelabel,
            min: parseFloat(attr.rangemin ? attr.rangemin : -10, 10),
            max: parseFloat(attr.rangemax ? attr.rangemax : 10, 10),
            stepValue: parseFloat(attr.rangestepvalue ? attr.rangestepvalue : 1),
            labelFrequency: attr.rangelabelfrequency,
          },
          scale: parseFloat(attr.scale ? attr.scale : 1, 10),
          maxPoints: parseInt(attr.maxpoints ? attr.maxpoints : null, 10),
          tickLabelFrequency: parseFloat(attr.ticklabelfrequency ? attr.ticklabelfrequency : 1, 10),
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

        function setGraphLabels(canvas) {
          var jxgbox = elem.find(".jxgbox");
          var coords = canvas.getPointCoords(0, 0);
          jxgbox.before('<div class="axis range-axis">'+canvasAttrs.range.label+'</div>');
          jxgbox.after('<div class="axis domain-axis">'+canvasAttrs.domain.label+'</div>');

          // domain
          var graphVCenter = elem.height() / 2;

          var domainAxis = elem.find('.domain-axis');
          var domainAxisWidth = domainAxis.width();
          domainAxis.css("left", elem.width() - (domainAxisWidth / 2) + (domainAxis.height() / 2));

          if (coords.y <= graphVCenter) {
            var offset = coords.y - domainAxis.height() / 4;
            domainAxis.css("top", offset < domainAxis.width() / 2 ? domainAxis.width() / 2 : offset);
          } else {
            var offset = elem.height() - coords.y - domainAxis.height() / 2;
            domainAxis.css("bottom", offset < domainAxis.width() / 2 ? domainAxis.width() / 2 : offset);
          }

          // range
          var graphHCenter = elem.width() / 2;
          var rangeAxis = elem.find('.range-axis');
          var rangeAxisWidth = rangeAxis.width();

          if (coords.x <= graphHCenter) {
            var offset = coords.x - (rangeAxisWidth / 2);
            rangeAxis.css("left", offset < 0 ? 0 : offset);
          } else {
            var offset = (canvasAttrs.width - coords.x) - (rangeAxisWidth / 2);
            rangeAxis.css("right", offset < 0 ? 0 : offset);
          }
        }

        var canvas = new Canvas(generateCanvasId(), canvasAttrs);
        setGraphLabels(canvas);

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
              canvas.makeLine([pt1, pt2], drawShape.name);
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
