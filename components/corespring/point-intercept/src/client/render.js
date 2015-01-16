var main = ['$compile', '$modal', '$rootScope',
  function($compile, $modal, $rootScope) {
    return {
      template: [
        "<div class='point-interaction-view'>",
        "  <div class='graph-interaction'>",
        "     <div class='additional-text' ng-show='additionalText'>",
        "         <p ng-bind-html-unsafe='additionalText'></p>",
        "     </div>",
        "     <div class='graph-controls' ng-show='showInputs' ng-hide='response'>",
        "        <div class='scale-display'>",
        "          <span>scale={{scale}}</span>",
        "           <div class='action undo'>",
        "             <a title='Undo' ng-click='undo()'>",
        "               <i class='fa fa-undo'/>",
        "             </a>",
        "           </div>",
        "           <div class='action start-over'>",
        "             <a title='Start Over' ng-click='startOver()'>",
        "               <i class='fa fa-refresh'/>",
        "             </a>",
        "           </div>",
        "        </div>",
        "     </div>",
        "     <div class='graph-container'></div>",
        "     <div id='initialParams' ng-transclude></div>",
        "  </div>",
        '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
        '  <div see-answer-panel class="solution-panel" ng-class="{panelVisible: correctResponse}">',
        "    <div class='solution-container'></div>",
        "  </div>",
        '  <div ng-show="response.comments" class="well" ng-bind-html-unsafe="response.comments"></div>',
        "</div>"
      ].join("\n"),
      restrict: 'AE',
      transclude: true,
      scope: true,
      controller: function($scope) {
        $scope.submissions = 0;
        $scope.points = {};
        $scope.solutionView = false;
        this.setInitialParams = function(initialParams) {
          $scope.initialParams = initialParams;
        };

        this.getInitialParams = function() {
          return $scope.initialParams;
        };

        $scope.$watch('graphCallback', function(n) {
          if ($scope.graphCallback) {
            if ($scope.initialParams) {
              $scope.graphCallback($scope.initialParams);
            }
            if ($scope.locked) {
              $scope.graphCallback({
                lockGraph: true
              });
            }
            if ($scope.answers) {
              $scope.renewResponse($scope.answers);
            }
          }
        });

        $scope.interactionCallback = function(params) {
          function round(coord) {
            var px = coord.x;
            var py = coord.y;
            if (px > $scope.domain) {
              px = $scope.domain;
            } else if (px < (0 - $scope.domain)) {
              px = 0 - $scope.domain;
            }
            if (py > $scope.range) {
              py = $scope.range;
            } else if (py < (0 - $scope.range)) {
              py = 0 - $scope.range;
            }
            if ($scope.sigfigs > -1) {
              var multiplier = Math.pow(10, $scope.sigfigs);
              px = Math.round(px * multiplier) / multiplier;
              py = Math.round(py * multiplier) / multiplier;
            }
            return {
              x: px,
              y: py
            };
          }

          if (params.points) {
            $scope.points = params.points;
            $scope.pointResponse = _.map(params.points, function(coord) {
              var newCoord = round(coord);
              return newCoord.x + "," + newCoord.y;
            });
            $scope.graphCallback({
              graphStyle: {}
            });
            var phase = $scope.$root.$$phase;
            if (phase !== '$apply' && phase !== '$digest') {
              $scope.$apply();
            }
          } else {
            $scope.pointResponse = null;
          }
        };

        $scope.lockGraph = function() {
          $scope.locked = true;
          $scope.graphCallback({
            lockGraph: true
          });
        };

        $scope.unlockGraph = function() {
          $scope.locked = false;
          $scope.graphCallback({
            unlockGraph: true
          });
          $scope.graphCallback({
            graphStyle: {},
            pointsStyle: "blue"
          });
        };

        $scope.renewResponse = function(response) {
          if (response) {
            var points = [];
            for (var i = 0; i < response.length; i++) {
              var point = response[i].split(",");
              points.push({
                x: point[0],
                y: point[1]
              });
            }
            if ($scope.graphCallback) {
              $scope.graphCallback({
                points: points
              });
            }
          }
          return response;
        };

        $scope.undo = function() {
          if (!$scope.locked) {
            var pointsArray = _.map($scope.points, function(point, ptName) {
              return {
                name: ptName,
                index: point.index
              };
            });
            var removeName = _.max(pointsArray, function(point) {
              return point.index;
            }).name;
            delete $scope.points[removeName];
            if ($scope.graphCallback) {
              $scope.graphCallback({
                points: $scope.points
              });
            }
          }
        };

        $scope.startOver = function() {
          if (!$scope.locked) {
            if ($scope.graphCallback) {
              $scope.graphCallback({
                points: {}
              });
            }
          }
        };
      },

      link: function(scope, element, attrs) {

        var createGraphAttributes = function(config, graphCallback) {
          return {
            "jsx-graph": "",
            "graph-callback": graphCallback || "graphCallback",
            "interaction-callback": "interactionCallback",
            domain: parseInt(config.domain ? config.domain : 10, 10),
            range: parseInt(config.range ? config.range : 10, 10),
            scale: parseFloat(config.scale ? config.scale : 1),
            domainLabel: config.domainLabel,
            rangeLabel: config.rangeLabel,
            tickLabelFrequency: config.tickLabelFrequency,
            pointLabels: config.labelsType === 'present' ? config.pointLabels : "",
            maxPoints: config.maxPoints,
            showLabels: config.showLabels ? config.showLabels : "true",
            showCoordinates: !_.isUndefined(config.showCoordinates) ? config.showCoordinates : "true"
          };
        };

        if (attrs.solutionView) {
          var containerWidth, containerHeight;
          var graphContainer = element.find('.graph-container');
          containerHeight = containerWidth = graphContainer.width();

          var graphAttrs = createGraphAttributes(scope.config);
          graphContainer.attr(graphAttrs);
          graphContainer.css({
            width: containerWidth,
            height: containerHeight
          });

          $compile(graphContainer)(scope);
        }

        function renderSolution() {
          var solutionScope = scope.$new();
          var solutionContainer = element.find('.solution-container');
          var solutionGraphAttrs = createGraphAttributes(scope.config, "graphCallbackSolution");
          solutionContainer.attr(solutionGraphAttrs);
          solutionContainer.css({
            width: Math.min(scope.containerWidth, 500),
            height: Math.min(scope.containerHeight, 500)
          });
          solutionScope.interactionCallback = function() {
          };
          solutionScope.$watch('graphCallbackSolution', function(solutionGraphCallback) {
            if (solutionGraphCallback) {
              var response = scope.correctResponse;
              var points = [];
              for (var i = 0; i < response.length; i++) {
                var point = response[i].split(",");
                points.push({
                  x: point[0],
                  y: point[1]
                });
              }
              solutionGraphCallback({
                points: points,
                lockGraph: true,
                pointsStyle: "#3C763D"
              });
            }
          });

          $compile(solutionContainer)(solutionScope);
        }

        scope.containerBridge = {

          setDataAndSession: function(dataAndSession) {
            var config = dataAndSession.data.model.config;
            scope.config = config;
            scope.model = dataAndSession.data.model;
            scope.additionalText = config.additionalText;
            scope.scale = config.scale;
            scope.domain = config.domain;
            scope.range = config.range;
            scope.sigfigs = parseInt(config.sigfigs ? config.sigfigs : -1, 10);
            scope.locked = config.hasOwnProperty('locked') ? true : false;
            scope.domainLabel = config.domainLabel;
            scope.rangeLabel = config.rangeLabel;
            scope.tickLabelFrequency = config.tickLabelFrequency;
            scope.showCoordinates = config.showCoordinates;
            scope.pointLabels = config.labelsType === 'present' ? config.pointLabels : "";
            scope.maxPoints = config.maxPoints;
            scope.showInputs = true;//(config.showInputs ? config.showInputs : 'true') === 'true';

            var containerWidth, containerHeight;
            var graphContainer = element.find('.graph-container');
            if (config.graphWidth && config.graphHeight) {
              containerWidth = parseInt(config.graphWidth, 10);
              containerHeight = parseInt(config.graphHeight, 10);
            } else {
              containerHeight = containerWidth = graphContainer.width();
            }
            scope.containerWidth = containerWidth;
            scope.containerHeight = containerHeight;

            var graphAttrs = createGraphAttributes(config);

            graphContainer.attr(graphAttrs);
            graphContainer.css({
              width: containerWidth,
              height: containerHeight
            });
            $compile(graphContainer)(scope);


            if (dataAndSession.session) {
              scope.answers = dataAndSession.session.answers;
            }
          },

          getSession: function() {
            return {
              answers: scope.pointResponse
            };
          },

          setResponse: function(response) {
            scope.feedback = response && response.feedback;
            scope.response = response;
            scope.correctClass = response.correctness;
            if (response && response.correctness === "correct") {
              scope.graphCallback({
                graphStyle: {
                  borderColor: "#3C763D",
                  borderWidth: "2px"
                },
                pointsStyle: "#3C763D"
              });
            } else {
              scope.graphCallback({
                graphStyle: {
                  borderColor: "#EEA236",
                  borderWidth: "2px"
                },
                pointsStyle: "#EEA236"
              });
              scope.correctResponse = response.correctResponse;

              if (response.correctResponse) {
                renderSolution();
              }
            }
          },

          setMode: function(newMode) {
          },

          reset: function() {
            scope.unlockGraph();

            scope.graphCallback({
              points: {}
            });

            var solutionContainer = element.find('.solution-container');
            solutionContainer.empty();

            scope.response = undefined;
            scope.feedback = undefined;
            scope.correctResponse = undefined;
            scope.isFeedbackVisible = false;
          },

          isAnswerEmpty: function() {
            return _.isEmpty(scope.pointResponse);
          },

          answerChangedHandler: function(callback) {
            scope.$watch("pointResponse", function(newValue, oldValue) {
              if (newValue !== oldValue) {
                callback();
              }
            }, true);

          },

          editable: function(e) {
            scope.editable = e;
          }

        };

        scope.$watch('editable', function(e) {
          if (!_.isUndefined(e) && e === false) {
            scope.graphCallback({
              lockGraph: true
            });
          }
        });
        scope.$emit('registerComponent', attrs.id, scope.containerBridge);

      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
