/* jshint evil: true */
var main = ['$compile', '$rootScope', "LineUtils",
  function($compile, $rootScope, LineUtils) {

    var lineUtils = new LineUtils();

    return {
      template: template(),
      restrict: 'AE',
      scope: true,
      link: link
    };

    function link(scope, element, attrs) {
      scope.points = {};
      scope.trueValue = true;
      scope.submissions = 0;
      scope.setInitialParams = function(initialParams) {
        scope.initialParams = initialParams;
      };

      scope.getInitialParams = function() {
        return scope.initialParams;
      };

      scope.$watch('graphCallback', function(n) {
        if (scope.graphCallback) {
          if (scope.initialParams) {
            scope.graphCallback(scope.initialParams);
          }
          if (scope.locked) {
            scope.graphCallback({
              lockGraph: true
            });
          }
          if (scope.points) {
            scope.renewResponse(scope.points);
          }
        }
      });

      scope.interactionCallback = function(params) {
        function setPoint(name) {
          if (params.points[name]) {
            var px = params.points[name].x;
            var py = params.points[name].y;
            if (px > scope.domain) {
              px = scope.domain;
            } else if (px < (0 - scope.domain)) {
              px = 0 - scope.domain;
            }
            if (py > scope.range) {
              py = scope.range;
            } else if (py < (0 - scope.range)) {
              py = 0 - scope.range;
            }
            if (scope.sigfigs > -1) {
              var multiplier = Math.pow(10, scope.sigfigs);
              px = Math.round(px * multiplier) / multiplier;
              py = Math.round(py * multiplier) / multiplier;
            }
            scope.points[name] = {
              x: px,
              y: py,
              isSet: true
            };
          }
        }

        if (params.points) {

          setPoint('A');
          setPoint('B');

          //if both points are created, draw line and set response
          if (params.points.A && params.points.B) {
            scope.graphCoords = [params.points.A.x + "," + params.points.A.y, params.points.B.x + "," + params.points.B.y];
            var slope = (params.points.A.y - params.points.B.y) / (params.points.A.x - params.points.B.x);
            var yintercept = params.points.A.y - (params.points.A.x * slope);
            scope.equation = "y=" + slope + "x+" + yintercept;
            scope.graphCallback({
              drawShape: {
                line: ["A", "B"],
                name: scope.config.curveLabel
              }
            });
          } else {
            scope.graphCoords = null;
          }

          var phase = scope.$root.$$phase;
          if (phase !== '$apply' && phase !== '$digest') {
            scope.$apply();
          }
        }
      };

      scope.lockGraph = function() {
        scope.locked = true;
        if (scope.graphCallback) {
          scope.graphCallback({
            lockGraph: true
          });
        }
      };

      scope.renewResponse = function(response) {
        if (response && response.A && response.B) {
          var A = response.A;
          var B = response.B;
          scope.points = {
            A: {
              x: A.x,
              y: A.y
            },
            B: {
              x: B.x,
              y: B.y
            }
          };
        }
        return response;
      };

      scope.$watch('points', function(points) {
        function checkCoords(coords) {
          return coords && !isNaN(coords.x) && !isNaN(coords.y);
        }

        var graphPoints = {};
        _.each(points, function(coords, ptName) {
          if (checkCoords(coords)) {
            graphPoints[ptName] = coords;
          }
        });

        if (scope.graphCallback) {
          scope.graphCallback({
            points: graphPoints
          });
        }
      }, true);

      scope.undo = function() {
        if (!scope.locked && scope.points.B && scope.points.B.isSet) {
          scope.points.B = {};
        } else if (!scope.locked && scope.points.A && scope.points.A.isSet) {
          scope.points.A = {};
        }
      };

      scope.startOver = function() {
        var initialValues = lineUtils.pointsFromEquation(scope.config.initialCurve);
        scope.points = {};
        if (_.isArray(initialValues)) {
            var pointA = initialValues[0];
            var pointB = initialValues[1];
            scope.points = {
                A: {
                    x: pointA[0],
                    y: pointA[1],
                    isSet: true,
                    isVisible: true
                },
                B: {
                    x: pointB[0],
                    y: pointB[1],
                    isSet: true
                }
            };
        }
      };

      scope.inputStyle = {
        width: "40px"
      };

      var createGraphAttributes = function(config, graphCallback) {

        function getModelValue(property, defaultValue, fallbackValue) {
          if (typeof property !== 'undefined' && property !== null) {
            return property;
          } else {
            if (typeof fallbackValue !== 'undefined' && property !== null) {
              return fallbackValue;
            } else {
              return defaultValue;
            }
          }
        }

        return {
          "jsx-graph": "",
          "graph-callback": graphCallback || "graphCallback",
          "interaction-callback": "interactionCallback",
          maxPoints: 2,
          domainLabel: config.domainLabel,
          domainMin: parseFloat(getModelValue(config.domainMin, -10, config.domain * -1), 10),
          domainMax: parseFloat(getModelValue(config.domainMax, 10, config.domain), 10),
          domainStepValue: parseFloat(getModelValue(config.domainStepValue)),
          domainLabelFrequency: parseFloat(getModelValue(config.domainLabelFrequency, 1, config.tickLabelFrequency), 10),
          domainGraphPadding: parseInt(getModelValue(config.domainGraphPadding, 50), 10),
          rangeLabel: config.rangeLabel,
          rangeMin: parseFloat(getModelValue(config.rangeMin, -10, config.range * -1)),
          rangeMax: parseFloat(getModelValue(config.rangeMax, 10, config.range * 1)),
          rangeStepValue: parseFloat(getModelValue(config.rangeStepValue)),
          rangeLabelFrequency: parseFloat(getModelValue(config.rangeLabelFrequency, 1, config.tickLabelFrequency, 10)),
          rangeGraphPadding: parseInt(getModelValue(config.rangeGraphPadding, 50), 10),
          showLabels: !_.isUndefined(config.showLabels) ? config.showLabels : true,
          showCoordinates: !_.isUndefined(config.showCoordinates) ? config.showCoordinates : true,
          showPoints: !_.isUndefined(config.showPoints) ? config.showPoints : true,
          pointLabels: !!config.showInputs ? "letters" : "none"
        };
      };

      if (attrs.solutionView) {
        var containerWidth, containerHeight;
        var graphContainer = element.find('.graph-container');
        containerHeight = containerWidth = graphContainer.width();

        var graphAttrs = createGraphAttributes(scope.config);
        scope.additionalText = "The equation is " + scope.answer.equation;
        graphContainer.attr(graphAttrs);
        graphContainer.css({
          width: containerWidth,
          height: containerHeight
        });
        scope.locked = false;

        $compile(graphContainer)(scope);
        scope.initialParams = {
          drawShape: {
            curve: function(x) {
              return eval(scope.answer.expression);
            }
          },
          submission: {
            lockGraph: false
          }
        };

      }

      scope.unlockGraph = function() {
        scope.locked = false;
        if (_.isFunction(scope.graphCallback)) {
          scope.graphCallback({
            graphStyle: {},
            pointsStyle: "blue",
            unlockGraph: true
          });
        }
      };


      function renderSolution(response) {
        var solutionScope = scope.$new();
        var solutionContainer = element.find('.solution-graph');
        var solutionGraphAttrs = createGraphAttributes(scope.config, "graphCallbackSolution");
        solutionContainer.attr(solutionGraphAttrs);
        solutionContainer.css({
          width: Math.min(scope.containerWidth, 500),
          height: Math.min(scope.containerHeight, 500)
        });
        solutionScope.interactionCallback = function() {};
        solutionScope.$watch('graphCallbackSolution', function(solutionGraphCallback) {
          if (solutionGraphCallback) {
            solutionGraphCallback({
              drawShape: {
                curve: function(x) {
                  return eval(response.correctResponse.expression);
                }
              },
              lockGraph: true,
              pointsStyle: "#3C763D",
              shapesStyle: "#3C763D"
            });
          }
        });

        $compile(solutionContainer)(solutionScope);
      }

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {

          var config = dataAndSession.data.model.config || {};
          scope.config = _.defaults(config, {
            showFeedback: true
          });

          var containerWidth, containerHeight;
          var graphContainer = element.find('.graph-container');
          if (config.graphWidth && config.graphHeight) {
            containerWidth = parseInt(config.graphWidth, 10);
            containerHeight = parseInt(config.graphHeight, 10);
          } else {
            containerHeight = containerWidth = graphContainer.width();
          }

          var graphAttrs = createGraphAttributes(config);
          scope.showInputs = config.showInputs;

          graphContainer.attr(graphAttrs);
          graphContainer.css({
            width: containerWidth,
            height: containerHeight
          });
          scope.containerWidth = containerWidth;
          scope.containerHeight = containerHeight;

          $compile(graphContainer)(scope);

          if (dataAndSession.session && dataAndSession.session.answers) {
            scope.points = dataAndSession.session.answers;
          }

          scope.startOver();

          if (config.exhibitOnly) {
            scope.lockGraph();
          } else {
            scope.unlockGraph();
          }
        },

        getSession: function() {
          return {
            answers: scope.points
          };
        },

        setInstructorData: function(data) {
          var cr = lineUtils.expressionize(data.correctResponse, "x");
          scope.graphCallback({
            clearBoard: true
          });
          scope.graphCallback({
            drawShape: {
              curve: function(x) {
                return eval(cr);
              }
            }
          });
          this.setResponse({correctness: 'correct'});
        },

        setResponse: function(response) {
          if (!response) {
            return;
          }
          scope.feedback = response && response.feedback;
          scope.response = response;
          scope.correctClass = response.correctness;
          if (response && response.correctness === "correct") {
            scope.graphCallback({
              graphStyle: {
                borderColor: "#3C763D",
                borderWidth: "2px"
              },
              pointsStyle: "#3C763D",
              shapesStyle: "#3C763D"
            });
            scope.inputStyle = _.extend(scope.inputStyle, {
              border: 'thin solid #3C763D'
            });
          } else if (response.correctness === "incorrect") {
            scope.graphCallback({
              graphStyle: {
                borderColor: "#EEA236",
                borderWidth: "2px"
              },
              pointsStyle: "#EEA236",
              shapesStyle: "#EEA236"
            });
            scope.inputStyle = _.extend(scope.inputStyle, {
              border: 'thin solid #EEA236'
            });
            scope.correctResponse = response.correctResponse;

            if (response.correctResponse) {
              renderSolution(response);
            }
          } else if (response && response.correctness === 'warning') {
            scope.graphCallback({
              graphStyle: {
                borderColor: "#999",
                borderWidth: "2px"
              }
            });
          }

          scope.lockGraph();
        },

        setMode: function(newMode) {},

        reset: function() {
          scope.feedback = undefined;
          scope.response = undefined;
          scope.correctClass = undefined;
          scope.graphCallback({
            clearBoard: true,
            graphStyle: {}
          });
          scope.unlockGraph();
          scope.graphCallback({
            shapesStyle: "blue"
          });

          scope.inputStyle = {
            width: "40px"
          };

          var solutionContainer = element.find('.solution-graph');
          solutionContainer.empty();

          scope.correctResponse = undefined;
          scope.points.B = scope.points.A = {};

          scope.startOver();
        },

        isAnswerEmpty: function() {
          var answer = this.getSession().answers;
          return _.isUndefined(answer) || _.isEmpty(answer) || answer.length === 0;
        },

        answerChangedHandler: function(callback) {
          scope.$watch("points", function(newValue, oldValue) {
            if (newValue !== oldValue) {
              callback();
            }
          }, true);

        },

        editable: function(e) {
          scope.editable = e;
        }

      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    }

    function template() {
      return [
        "<div class='line-interaction-view'>",
        "<div class='graph-interaction'>",
        "   <div id='additional-text' class='row-fluid additional-text' ng-show='additionalText'>",
        "       <p>{{additionalText}}</p>",
        "   </div>",
        "   <div class='graph-controls' ng-show='showInputs'>",
        "       <div id='inputs' class='col-sm-5' style='margin-right: 17px;'>",
        "           <div class='point-display' style='padding-bottom: 10px;'>",
        "              <p>Point A:</p>",
        "              <p>x: </p>",
        "              <input type='text' ng-style='inputStyle', ng-model='points.A.x' ng-disabled='locked'>",
        "              <p>y: </p>",
        "              <input type='text' ng-style='inputStyle' ng-model='points.A.y'  ng-disabled='locked'>",
        "          </div>",
        "          <hr class='point-display-break'>",
        "          <div class='point-display' style='padding-top: 10px;'>",
        "             <p>Point B:</p>",
        "             <p>x: </p>",
        "             <input type='text' ng-style='inputStyle' ng-model='points.B.x' ng-disabled='locked'>",
        "             <p>y: </p>",
        "             <input type='text' ng-style='inputStyle' ng-model='points.B.y' ng-disabled='locked'>",
        "          </div>",
        "      </div>",
        "      <div class='scale-display'>",
        "         <div class='action undo'>",
        "           <a title='Undo' ng-click='undo()'>",
        "             <i class='fa fa-undo'/>",
        "           </a>",
        "         </div>",
        "         <div class='action start-over'>",
        "           <a title='Start Over' ng-click='startOver()'>",
        "             <i class='fa fa-refresh'/>",
        "           </a>",
        "         </div>",
        "      </div>",
        "      <div class='clearfix'> </div>",
        "      <div class='clearfix'> </div>",
        "   </div>",
        "   <div id='graph-container' class='row-fluid graph-container'></div>",
        "</div>",
        '<div class="feedback-holder" ng-show="config.showFeedback">',
        '  <div ng-show="feedback" feedback="feedback" correct-class="{{correctClass}}"></div>',
        '</div>',
        '<div see-answer-panel see-answer-panel-expanded="trueValue" class="solution-panel" ng-class="{panelVisible: correctResponse}">',
        "  <div class='solution-container'>",
        "     <span>The correct equation is {{correctResponse.equation}}</span>",
        "     <div class='solution-graph'></div>",
        "  </div>",
        "</div>",
        '<div ng-show="response.comments" class="well" ng-bind-html-unsafe="response.comments"></div>',
        "</div>"
      ].join("");
    }
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];