
var jsxGraph = ['Canvas', function (Canvas) {
  return {
    template: "<div class='jxgbox' ng-style='boxStyle' style='width: 100%; height: 100%'></div>",
    restrict: 'A',
    scope: {
      interactionCallback: '=',
      graphCallback: '='
    },
    link: function (scope, elem, attr) {
      //global vars
      var canvasAttrs = {
        domain: parseInt(attr.domain ? attr.domain : 10),
        range: parseInt(attr.range ? attr.range : 10),
        scale: parseFloat(attr.scale ? attr.scale : 1),
        maxPoints: parseInt(attr.maxpoints ? attr.maxpoints : null),
        domainLabel: attr.domainlabel,
        rangeLabel: attr.rangelabel,
        tickLabelFrequency: parseInt(attr.ticklabelfrequency ? attr.ticklabelfrequency : 5),
        pointLabels: attr.pointlabels,
        width: elem.width(),
        height: elem.height(),
        showLabels: attr.showlabels
      };

      function generateCanvasId() {
        var canvasId = Math.random().toString(36).substring(7);
        elem.find(".jxgbox").attr("id", canvasId)
        return canvasId
      }

      var canvas = new Canvas(generateCanvasId(), canvasAttrs);
      //define callbacks
      canvas.on('up', function (e) {
        var coords = canvas.getMouseCoords(e);
        if ((!canvasAttrs.maxPoints || canvas.points.length < canvasAttrs.maxPoints) && !canvas.pointCollision(coords)) {
          addPoint(coords);
        }
      });
      var lockGraph = false;
      var points = {}
      var onPointMove = function (point, coords) {
        if (!lockGraph) {
          if (coords != null) point.moveTo([coords.x, coords.y]);
          points[point.name] = {x: point.X(), y: point.Y(), index: point.canvasIndex};
          scope.interactionCallback({points: points});
        }
      };
      var addPoint = function (coords, ptName) {
        if (!lockGraph) {
          var point = canvas.addPoint(coords, ptName);
          point.on('up', function (e) {
            onPointMove(point);
          })
          onPointMove(point);
          return point;
        }
      };
      var clearBoard = function () {
        while (canvas.points.length > 0) {
          canvas.popPoint();
        }
        while (canvas.shapes.length > 0) {
          canvas.popShape();
        }
        points = {}
      }

      function processPointsCallback(paramPoints) {
        if (!lockGraph) clearBoard();
        if (_.isObject(paramPoints)) {
          for (var ptName in paramPoints) {
            var point = paramPoints[ptName];
            var coordx = parseFloat(point.x);
            var coordy = parseFloat(point.y);
            if (!isNaN(coordx) && !isNaN(coordy)) {
              var coords = {
                x: coordx,
                y: coordy
              };
              var canvasPoint = null;
              for (var i = 0; i < canvas.points.length; i++) {
                if (ptName === canvas.points[i].name) {
                  canvasPoint = canvas.points[i];
                }
              }
              //if the coordinates for a point that exists has changed, then update that point
              //otherwise, a new point will be created
              if (canvasPoint != null) {
                if (canvasPoint.X() !== coords.x || canvasPoint.Y() !== coords.y) {
                  onPointMove(canvasPoint, coords);
                }
              } else if (!canvasAttrs.maxPoints || canvas.points.length < canvasAttrs.maxPoints) {
                canvasPoint = addPoint(coords);
              }
              if (point.color) canvas.changePointColor(canvasPoint, point.color)
            }
          }
        } else if (_.isArray(paramPoints)) {
          for (var i = 0; i < paramPoints.length; i++) {
            var coordx = parseFloat(paramPoints[i].x);
            var coordy = parseFloat(paramPoints[i].y);
            if (!isNaN(coordx) && !isNaN(coordy)) {
              var coords = {
                x: coordx,
                y: coordy
              };
              var canvasPoint = canvas.pointCollision(coords)
              if (canvasPoint == null) {
                canvasPoint = addPoint(coords)
              }
            }
            if (paramPoints[i].color) canvas.changePointColor(canvasPoint, paramPoints[i].color)
          }
        }
      }

      function drawShapeCallback(drawShape) {
        if (drawShape.line && !lockGraph) {
          var pt1 = canvas.getPoint(drawShape.line[0]);
          var pt2 = canvas.getPoint(drawShape.line[1]);
          if (pt1 && pt2) {
            canvas.makeLine([pt1, pt2]);
          }
        } else if (drawShape.curve && !lockGraph) {
          canvas.makeCurve(drawShape.curve)
        }
      }

      scope.graphCallback = function (params) {
        if (params.points && canvas) {
          processPointsCallback(params.points)
        }
        if (params.drawShape && canvas) {
          drawShapeCallback(params.drawShape)
        }
        if (params.clearBoard && canvas) {
          clearBoard();
          scope.boxStyle = {width: "100%", height: "100%"};
          lockGraph = false;
        }
        if (params.pointsStyle && canvas) {
          _.each(canvas.points, function (p) {
            canvas.changePointColor(p, params.pointsStyle)
          })
        }
        if (params.graphStyle) {
          scope.boxStyle = _.extend({width: "100%", height: "100%"}, params.graphStyle)
        }
        if (params.shapesStyle && canvas) {
          _.each(canvas.shapes, function (shape) {
            canvas.changeShapeColor(shape, params.shapesStyle)
          })
        }
        if (params.lockGraph && canvas) {
          _.each(canvas.points, function (p) {
            p.setAttribute({fixed: true});
          });
          lockGraph = true;
        }
      };
    }
  };
}];

var graphpoint = function () {
  return {
    restrict: "E",
    require: '^pointinteraction',
    scope: {},
    compile: function (element, attrs, transclude) {
      element.attr('hidden', '');
      var locked = element.parent()[0].attributes.getNamedItem('locked') ? true : false;
      return function (scope, element, attrs, PointCtrl) {
        var coords = element[0].innerHTML.split(",");
        if (coords.length == 2) {
          var point = {x: coords[0], y: coords[1]};
          if (attrs.color) point = _.extend(point, {color: attrs.color})
          var points = []
          if (PointCtrl.getInitialParams() && PointCtrl.getInitialParams().points) {
            points = PointCtrl.getInitialParams().points
          }
          points.push(point)
          PointCtrl.setInitialParams({ points: points })
        } else {
          throw "each point must contain x and y coordinate separated by a comma";
        }
      };
    }
  }
};

var main = ['$compile',
  function ($compile) {
    return {
      template: [
        "<div class='graph-interaction'>",
        "   <div class='additional-text' ng-show='additionalText'>",
        "       <p>{{additionalText}}</p>",
        "   </div>",
        "   <div id='scale-display' class='scale-display' ng-show='showInputs'>",
        "       scale={{scale}}",
        "       <button type='button' class='btn btn-default btn-undo' ng-click='undo()'>Undo</button>",
        "       <button type='button' class='btn btn-default btn-start-over' ng-click='startOver()'>Start Over</button>",
        "   </div>",
        "   <div class='graph-container'></div>",
        "   <div id='initialParams' ng-transclude></div>",
        "</div>"].join("\n"),
      restrict: 'AE',
      transclude: true,
      scope: true,
      require: '?^assessmentitem',
      controller: ['$scope', function ($scope) {
        $scope.submissions = 0;
        $scope.points = {};
        this.setInitialParams = function (initialParams) {
          $scope.initialParams = initialParams;
        };

        this.getInitialParams = function () {
          return $scope.initialParams;
        };

        $scope.$watch('graphCallback', function () {
          if ($scope.graphCallback) {
            if ($scope.initialParams) {
              $scope.graphCallback($scope.initialParams);
            }
            if ($scope.locked) {
              $scope.graphCallback({lockGraph: true})
            }
          }
        });

        $scope.$watch('showNoResponseFeedback', function () {
//          if (!$scope.locked && $scope.isEmptyItem($scope.graphCoords) && $scope.showNoResponseFeedback) {
//            $scope.graphCallback({graphStyle: {borderColor: "yellow", borderWidth: "2px"}});
//          }
        });

        $scope.interactionCallback = function (params) {
          function round(coord) {
            var px = coord.x;
            var py = coord.y;
            if (px > $scope.domain) {
              px = $scope.domain;
            }
            else if (px < (0 - $scope.domain)) {
              px = 0 - $scope.domain;
            }
            if (py > $scope.range) {
              py = $scope.range;
            }
            else if (py < (0 - $scope.range)) {
              py = 0 - $scope.range;
            }
            if ($scope.sigfigs > -1) {
              var multiplier = Math.pow(10, $scope.sigfigs);
              px = Math.round(px * multiplier) / multiplier;
              py = Math.round(py * multiplier) / multiplier;
            }
            return {x: px, y: py};
          }

          if (params.points) {
            $scope.points = params.points;
            $scope.pointResponse = _.map(params.points, function (coord) {
              var newCoord = round(coord);
              return newCoord.x + "," + newCoord.y;
            });
            $scope.graphCallback({graphStyle: {}});
//            $scope.controller.setResponse($scope.responseIdentifier, $scope.pointResponse);
          } else {
            $scope.pointResponse = null;
          }
        };

        function lockGraph() {
          $scope.locked = true;
          $scope.graphCallback({lockGraph: true});
        }

        $scope.$on('controlBarChanged', function () {
          if ($scope.settingsHaveChanged) {
            $scope.graphCallback({clearBoard: true});
            $scope.correctAnswerBody = "clear";
            $scope.locked = false;
          }
        });

        function renewResponse() {
          var response = _.find($scope.itemSession.responses, function (r) {
            return r.id === $scope.responseIdentifier;
          });
          if (response) {
            var points = [];
            for (var i = 0; i < response.value.length; i++) {
              var point = response.value[i].split(",");
              points.push({x: point[0], y: point[1]});
            }
            $scope.graphCallback({points: points});
          }
          return response;
        }

        $scope.$on("highlightUserResponses", function () {
          if ($scope.itemSession.responses) {
            renewResponse();
          }
        });

        $scope.$on("formSubmitted", function () {
          if (!$scope.locked) {
            $scope.submissions++;
            var response = renewResponse();
            if ($scope.itemSession.settings.highlightUserResponse) {
              if (response && response.outcome.isCorrect) {
                $scope.graphCallback({graphStyle: {borderColor: "green", borderWidth: "2px"}, pointsStyle: "green"})
              } else {
                $scope.graphCallback({graphStyle: {borderColor: "red", borderWidth: "2px"}, pointsStyle: "red"})
              }
            }
            var maxAttempts = $scope.itemSession.settings.maxNoOfAttempts ? $scope.itemSession.settings.maxNoOfAttempts : 1
            if ($scope.submissions >= maxAttempts) {
              lockGraph();
            } else if (maxAttempts == 0 && response && response.outcome.isCorrect) {
              lockGraph();
            }
            if ($scope.itemSession.settings.highlightCorrectResponse) {
              var correctResponse = _.find($scope.itemSession.sessionData.correctResponses, function (cr) {
                return cr.id == $scope.responseIdentifier;
              });
              if (correctResponse && correctResponse.value && !response.outcome.isCorrect) {
                var startElem = [
                  "<pointInteraction responseIdentifier=" + $scope.responseIdentifier,
                  "point-labels=" + $scope.pointLabels,
                  "max-points=" + $scope.maxPoints,
                  "locked=''",
                  "graph-width=300",
                  "graph-height=300",
                  ">"
                ]
                var body = _.map(correctResponse.value, function (value) {
                  return "<graphpoint color='green'>" + value + "</graphpoint>"
                })
                var endElem = ["</pointInteraction>"]
                $scope.correctAnswerBody = _.flatten([startElem, body, endElem]).join("\n");
              }
            }
          }
        });
        $scope.undo = function () {
          if (!$scope.locked) {
            var pointsArray = _.map($scope.points, function (point, ptName) {
              return {name: ptName, index: point.index }
            });
            var removeName = _.max(pointsArray,function (point) {
              return point.index;
            }).name;
            delete $scope.points[removeName]
            if ($scope.graphCallback) {
              $scope.graphCallback({points: $scope.points});
            }
          }
        }
        $scope.startOver = function () {
          if (!$scope.locked) {
            if ($scope.graphCallback) {
              $scope.graphCallback({points: {}});
            }
          }
        }
      }],
      compile: function (element, attrs, transclude) {
        var graphAttrs = {
          "jsx-graph": "",
          "graph-callback": "graphCallback",
          "interaction-callback": "interactionCallback",
          domain: parseInt(attrs.domain ? attrs.domain : 10),
          range: parseInt(attrs.range ? attrs.range : 10),
          scale: parseFloat(attrs.scale ? attrs.scale : 1),
          domainLabel: attrs.domainLabel,
          rangeLabel: attrs.rangeLabel,
          tickLabelFrequency: attrs.tickLabelFrequency,
          pointLabels: attrs.pointLabels,
          maxPoints: attrs.maxPoints,
          showLabels: attrs.showLabels ? attrs.showLabels : "true"
        };
        return function (scope, element, attrs, AssessmentItemController) {
          var containerWidth, containerHeight;
          var graphContainer = element.find('.graph-container')
          if (attrs.graphWidth && attrs.graphHeight) {
            containerWidth = parseInt(attrs.graphWidth)
            containerHeight = parseInt(attrs.graphHeight)
          } else {
            containerHeight = containerWidth = graphContainer.width()
          }
          graphContainer.attr(graphAttrs);
          graphContainer.css({width: containerWidth, height: containerHeight});
          $compile(graphContainer)(scope);
          scope.additionalText = attrs.additionalText;
          scope.scale = graphAttrs.scale;
          scope.domain = graphAttrs.domain;
          scope.range = graphAttrs.range;
          scope.sigfigs = parseInt(attrs.sigfigs ? attrs.sigfigs : -1);
          scope.responseIdentifier = attrs.responseidentifier;
          scope.controller = AssessmentItemController;
          if (scope.controller) scope.controller.registerInteraction(element.attr('responseIdentifier'), "line graph", "graph");
          scope.locked = attrs.hasOwnProperty('locked') ? true : false;
          if (!scope.locked && scope.controller) {
            scope.controller.setResponse(scope.responseIdentifier, null);
            element.find(".graph-interaction").append("<correctanswer class='correct-answer' correct-answer-body='correctAnswerBody' responseIdentifier={{responseIdentifier}}>See the correct answer</correctanswer>")
            $compile(element.find("correctanswer"))(scope)
          }
          scope.domainLabel = graphAttrs.domainLabel
          scope.rangeLabel = graphAttrs.rangeLabel
          scope.tickLabelFrequency = attrs.tickLabelFrequency
          scope.pointLabels = graphAttrs.pointLabels
          scope.maxPoints = graphAttrs.maxPoints
          scope.showInputs = (attrs.showInputs ? attrs.showInputs : 'true') == 'true'
        }
      }
    }
  }
];


exports.framework = 'angular';
exports.directives = [
  { directive: main },
  { name: 'jsxGraph', directive: jsxGraph },
  { name: 'graphpoint', directive: graphpoint },
];

