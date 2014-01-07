var main = ['$compile', '$modal',
  function ($compile, $modal) {
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
        "   <div style='padding-top: 20px'><a ng-click='seeSolution()'>See correct answer</a></div>",
        "   <div id='initialParams' ng-transclude></div>",
        "</div>"].join("\n"),
      restrict: 'AE',
      transclude: true,
      scope: true,
      controller: function ($scope) {
        $scope.submissions = 0;
        $scope.points = {};
        this.setInitialParams = function (initialParams) {
          $scope.initialParams = initialParams;
        };

        this.getInitialParams = function () {
          return $scope.initialParams;
        };

        $scope.$watch('graphCallback', function (n) {
          if ($scope.graphCallback) {
            if ($scope.initialParams) {
              $scope.graphCallback($scope.initialParams);
            }
            if ($scope.locked) {
              $scope.graphCallback({lockGraph: true})
            }
            if ($scope.answers) {
              $scope.renewResponse($scope.answers);
            }
          }
        });

        $scope.$watch('showNoResponseFeedback', function () {
          // TODO: Empty response submission - 2px yellow border
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
            console.log("Response is: ", $scope.pointResponse);
          } else {
            $scope.pointResponse = null;
          }
        };

        $scope.lockGraph = function () {
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

        $scope.renewResponse = function (response) {
          if (response) {
            var points = [];
            for (var i = 0; i < response.length; i++) {
              var point = response[i].split(",");
              points.push({x: point[0], y: point[1]});
            }
            if ($scope.graphCallback)
              $scope.graphCallback({points: points});
          }
          return response;
        };

        $scope.$on("formSubmitted", function () {
          if (!$scope.locked) {
            $scope.submissions++;
            var response = $scope.renewResponse();
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
                  "<corespring-point-intercept responseIdentifier=" + $scope.responseIdentifier,
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
                var endElem = ["</corespring-point-intercept>"]
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
        };

        $scope.startOver = function () {
          if (!$scope.locked) {
            if ($scope.graphCallback) {
              $scope.graphCallback({points: {}});
            }
          }
        }
      },

      link: function (scope, element, attrs) {

        scope.seeSolution = function () {
          $modal.open({
            controller: function ($scope, $modalInstance) {
              $scope.ok = function () {
                $modalInstance.dismiss('cancel');
              };
            },
            template: [
              '     <div class="modal-header">',
              '     <h3>Answer</h3>',
              '   </div>',
              '   <div class="modal-body">',
              '     <corespring-point-intercept id="solution"></corespring-point-intercept>',
              '   </div>',
              '   <div class="modal-footer">',
              '     <button class="btn btn-primary" ng-click="ok()">OK</button>',
              '   </div>',
            ].join(""),
            backdrop: true,
            scope: scope.solutionScope
          });

        };

        scope.containerBridge = {

          setDataAndSession: function (dataAndSession) {
            console.log("Setting Session for Point", dataAndSession);
            var config = dataAndSession.data.model.config;

            scope.additionalText = config.additionalText;
            scope.scale = config.scale;
            scope.domain = config.domain;
            scope.range = config.range;
            scope.sigfigs = parseInt(config.sigfigs ? config.sigfigs : -1);
            scope.locked = config.hasOwnProperty('locked') ? true : false;
//              if (!scope.locked) {
//                element.find(".graph-interaction").append("<correctanswer class='correct-answer' correct-answer-body='correctAnswerBody' responseIdentifier={{responseIdentifier}}>See the correct answer</correctanswer>")
//                $compile(element.find("correctanswer"))(scope)
//              }
            scope.domainLabel = config.domainLabel
            scope.rangeLabel = config.rangeLabel
            scope.tickLabelFrequency = config.tickLabelFrequency
            scope.pointLabels = config.pointLabels
            scope.maxPoints = config.maxPoints
            scope.showInputs = (config.showInputs ? config.showInputs : 'true') == 'true'


            var containerWidth, containerHeight;
            var graphContainer = element.find('.graph-container')
            if (config.graphWidth && config.graphHeight) {
              containerWidth = parseInt(config.graphWidth)
              containerHeight = parseInt(config.graphHeight)
            } else {
              containerHeight = containerWidth = graphContainer.width()
            }

            var graphAttrs = {
              "jsx-graph": "",
              "graph-callback": "graphCallback",
              "interaction-callback": "interactionCallback",
              domain: parseInt(config.domain ? config.domain : 10),
              range: parseInt(config.range ? config.range : 10),
              scale: parseFloat(config.scale ? config.scale : 1),
              domainLabel: config.domainLabel,
              rangeLabel: config.rangeLabel,
              tickLabelFrequency: config.tickLabelFrequency,
              pointLabels: config.pointLabels,
              maxPoints: config.maxPoints,
              showLabels: config.showLabels ? config.showLabels : "true"
            };

            graphContainer.attr(graphAttrs);
            graphContainer.css({width: containerWidth, height: containerHeight});
            $compile(graphContainer)(scope);

            if (dataAndSession.session) {
              scope.answers = dataAndSession.session.answers;
            }
          },

          getSession: function () {
            return {
              answers: scope.pointResponse
            };
          },

          setResponse: function (response) {
            console.log("Setting Response for Point Interaction", response);
            if (response && response.correctness == "correct") {
              scope.graphCallback({graphStyle: {borderColor: "green", borderWidth: "2px"}, pointsStyle: "green"})
            } else {
              scope.graphCallback({graphStyle: {borderColor: "red", borderWidth: "2px"}, pointsStyle: "red"})
            }

            scope.lockGraph();

            var correctResponse = response.correctResponse;
            if (correctResponse) {
              var startElem = [
                "<pointInteraction ",
                "point-labels=" + scope.pointLabels,
                "max-points=" + scope.maxPoints,
                "locked=''",
                "graph-width=300",
                "graph-height=300",
                ">"
              ]
              var body = _.map(correctResponse, function (value) {
                return "<graphpoint color='green'>" + value + "</graphpoint>"
              })
              var endElem = ["</pointInteraction>"]
              scope.correctAnswerBody = _.flatten([startElem, body, endElem]).join("\n");
              console.log("Corr Ans: ", scope.correctAnswerBody);
            }

          },

          setMode: function (newMode) {
          },

          reset: function () {
          },

          isAnswerEmpty: function () {
            return _.isUndefined(scope.pointResponse) || _.isEmpty(scope.pointResponse) || scope.pointResponse.length == 0;
          },

          answerChangedHandler: function (callback) {
          },

          editable: function (e) {
            scope.editable = e;
          }

        };

        scope.$emit('registerComponent', attrs.id, scope.containerBridge);

      }
    }
  }
];


var correctanswer = ['$compile', function ($compile) {
  return {
    restrict: 'E',
    template: [
      "<div>",
      "<a href='' ng-click='showCorrectAnswer=true' ng-show='incorrectResponse' ng-transclude></a>",
      "<div ui-modal ng-model='showCorrectAnswer' close='showCorrectAnswer=false'>",
      "<div class='modal-header'>",
      "<button type='button' class='close' ng-click='showCorrectAnswer=false'>&#215;</button>",
      "<h3 id='myModalLabel'>The Correct Answer</h3>",
      "</div>",
      "<div class='modal-body'></div>",
      "<div class='modal-footer' style='text-align: left;'><a href='' ng-click='showCorrectAnswer=false'>See your answer</a></div>",
      "</div>",
      "</div>"
    ].join("\n"),
    scope: {correctAnswerBody: '='},
    transclude: true,
    link: function (scope, element, attrs) {
      scope.$watch("correctAnswerBody", function () {
        if (scope.correctAnswerBody) {
          if (scope.correctAnswerBody === "clear") {
            scope.incorrectResponse = false
          } else {
            scope.incorrectResponse = true;
            element.find('.modal-body').html(scope.correctAnswerBody)
            $compile(element.find('.modal-body'))(scope)
          }
        }
      })
    }
  }
}];


exports.framework = 'angular';
exports.directives = [
  { directive: main },
  { name: 'correctanswer', directive: correctanswer }
];

