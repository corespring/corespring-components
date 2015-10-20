var def = ['Canvas',
  function(Canvas) {
    return {
      template: "<div class='jxgbox' ng-style='boxStyle' style='width: 100%; height: 100%'></div>",
      restrict: 'A',
      scope: {
        interactionCallback: '=',
        graphCallback: '=',
        hoveredLine: '='
      },
      link: function(scope, elem, attr) {

        var getCanvasAttributes = function() {
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
            width: elem.width(),
            height: elem.height(),
            showLabels: attr.showlabels,
            showCoordinates: attr.showcoordinates,
            showPoints: attr.showpoints
          };
        };

        var generateCanvasId = function() {
          var canvasId = Math.random().toString(36).substring(7);
          elem.find(".jxgbox").attr("id", canvasId);
          return canvasId;
        };

        // add x and y axis outside the graph
        var setGraphLabels = function(canvas) {
          var jxgbox = elem.find(".jxgbox");
          var coords = canvas.getPointCoords(0, 0);
          var offset;
          jxgbox.before('<div class="axis range-axis">'+canvasAttrs.range.label+'</div>');
          jxgbox.after('<div class="axis domain-axis">'+canvasAttrs.domain.label+'</div>');

          // domain
          var graphVCenter = elem.height() / 2;

          var domainAxis = elem.find('.domain-axis');
          var domainAxisWidth = domainAxis.width();
          domainAxis.css("left", elem.width() - (domainAxisWidth / 2) + (domainAxis.height() / 2));

          if (coords.y <= graphVCenter) {
            offset = coords.y - domainAxis.height() / 4;
            domainAxis.css("top", offset < domainAxis.width() / 2 ? domainAxis.width() / 2 : offset);
          } else {
            offset = elem.height() - coords.y - domainAxis.height() / 2;
            domainAxis.css("bottom", offset < domainAxis.width() / 2 ? domainAxis.width() / 2 : offset);
          }

          // range
          var graphHCenter = elem.width() / 2;
          var rangeAxis = elem.find('.range-axis');
          var rangeAxisWidth = rangeAxis.width();

          if (coords.x <= graphHCenter) {
            offset = coords.x - (rangeAxisWidth / 2);
            rangeAxis.css("left", offset < 0 ? 0 : offset);
          } else {
            offset = (canvasAttrs.width - coords.x) - (rangeAxisWidth / 2);
            rangeAxis.css("right", offset < 0 ? 0 : offset);
          }
        };

        var addCanvasPoint = function(coords, ptName, ptOptions) {
          var point = canvas.addPoint(coords, ptName, ptOptions);
          point.on('up', function(e) {
            onPointMove(point);
            return false;
          });
          return point;
        };

        var addPoint = function(coords, ptName, ptOptions) {
          var point = addCanvasPoint(coords, ptName, ptOptions);
          return getPointData(point);
        };

        var addUserPoint = function(coords, ptName, ptOptions) {
          var point = addCanvasPoint(coords, ptName, ptOptions);
          onPointMove(point);
          return point;
        };

        var onPointMove = function(point, coords) {
          if (coords) {
            point.moveTo([coords.x, coords.y]);
          }

          var movedPoint = getPointData(point);
          points[point.name] = movedPoint;

          scope.interactionCallback({
            points: points,
            point: movedPoint
          });
        };

        var getPointData = function(point) {
          return {
            index: point.canvasIndex,
            name: point.name,
            x: (Math.round(point.X() * 100) / 100),
            y: (Math.round(point.Y() * 100) / 100)
          };
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

        var drawShapeCallback = function(drawShape) {
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
            shape = canvas.makeCurve(drawShape.curve);
          }

          if(!_.isUndefined(scope.hoveredLine)) {
            shape.on('over', function(){
              scope.hoveredLine = this.customId;
            });
            shape.on('out', function(){
              scope.hoveredLine = -1;
            });
          }
        };

        var addCallback = function(add) {
          if (add.point) {
            var options = {};
            if(add.color) {
              options.strokeColor = add.color;
              options.fillColor = add.color;
            }
            if(add.name) {
              options.name = add.name;
            }

            if(add.triggerCallback) {
              return getPointData(addUserPoint(add.point, undefined, options));
            } else {
              return addPoint(add.point, undefined, options);
            }
          }
        };

        var updateCallback = function(update) {
          if (update.point) {
            canvas.getPoint(update.point.name).moveTo([update.point.x, update.point.y]);
          }
        };

        var removeCallback = function(remove) {
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
        };

        var pointColorCallback = function(pointColor) {
          if (pointColor.points) {
            _.each(pointColor.points, function(point) {
              canvas.changePointColor(canvas.getPoint(point), pointColor.color);
            });
          } else if (pointColor.point) {
            canvas.changePointColor(canvas.getPoint(pointColor.point), pointColor.color);
          }
        };

        var canvasAttrs = getCanvasAttributes();
        var lockGraph = false;
        var points = {};

        // initialize canvas
        var canvas = new Canvas(generateCanvasId(), canvasAttrs);
        setGraphLabels(canvas);

        // define canvas callbacks
        canvas.on('up', function(e) {
          if (lockGraph) {
            return;
          }
          var coords = canvas.getMouseCoords(e);
          if ((!canvasAttrs.maxPoints || canvas.points.length < canvasAttrs.maxPoints) && !canvas.pointCollision(coords)) {
            addUserPoint(coords);
          }
        });

        scope.graphCallback = function(params) {
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

        // still used on single line, plot point components
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
      }
    };
  }];

exports.framework = "angular";
exports.directive = {
  name: "jsxGraph",
  directive: def
};
