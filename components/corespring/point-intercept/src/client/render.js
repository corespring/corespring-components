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

          scope.containerBridge = {

            setDataAndSession: function (dataAndSession) {
              console.log("Setting Session for Point", dataAndSession);
              var config = dataAndSession.data.model.config;

              scope.additionalText = config.additionalText;
            },

            getSession: function () {
            },

            setResponse: function (response) {
            },

            setMode : function(newMode) {
            },

            reset : function(){
            },

            isAnswerEmpty: function(){
            },

            answerChangedHandler: function(callback){
            },

            editable: function (e) {
            }

          };

          scope.$emit('registerComponent', attrs.id, scope.containerBridge);


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
          scope.scale = graphAttrs.scale;
          scope.domain = graphAttrs.domain;
          scope.range = graphAttrs.range;
          scope.sigfigs = parseInt(attrs.sigfigs ? attrs.sigfigs : -1);
          scope.responseIdentifier = attrs.responseidentifier;
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
  { directive: main }
];

