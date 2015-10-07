/* jshint evil: true */
var main = ['$compile', '$rootScope', '$timeout', "LineUtils",
  function($compile, $rootScope, $timeout, LineUtils) {

    var lineUtils = new LineUtils();

    return {
      template: template(),
      restrict: 'AE',
      scope: true,
      link: link
    };

    function link(scope, element, attrs) {
      scope.lines = [];
      scope.pointsPerLine = {};
      scope.plottedPoint = {};
      scope.forcedNextLine = -1;

      scope.inputStyle = {
        width: "40px"
      };

      // set intitial state for jsxgraph directive
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
          maxPoints: scope.config.lines.length * 2,
          domainLabel: config.domainLabel,
          domainMin: parseFloat(getModelValue(config.domainMin, -10, config.domain * -1), 10),
          domainMax: parseFloat(getModelValue(config.domainMax, 10, config.domain), 10),
          domainStepValue: parseFloat(getModelValue(config.domainStepValue)),
          domainLabelFrequency: parseFloat(getModelValue(config.domainLabelFrequency, 1, config.tickLabelFrequency), 10),
          domainGraphPadding: parseInt(getModelValue(config.domainGraphPadding, 25), 10),
          rangeLabel: config.rangeLabel,
          rangeMin: parseFloat(getModelValue(config.rangeMin, -10, config.range * -1)),
          rangeMax: parseFloat(getModelValue(config.rangeMax, 10, config.range * 1)),
          rangeStepValue: parseFloat(getModelValue(config.rangeStepValue)),
          rangeLabelFrequency: parseFloat(getModelValue(config.rangeLabelFrequency, 1, config.tickLabelFrequency, 10)),
          rangeGraphPadding: parseInt(getModelValue(config.rangeGraphPadding, 25), 10),
          showLabels: !_.isUndefined(config.showLabels) ? config.showLabels : true,
          showCoordinates: !_.isUndefined(config.showCoordinates) ? config.showCoordinates : true,
          showPoints: !_.isUndefined(config.showPoints) ? config.showPoints : true,
          pointLabels: !!config.showInputs ? "letters" : "none"
        };
      };

      scope.interactionCallback = function(params) {
        setPoint(params.point);
      };

      scope.nextLine = function() {
        if(scope.forcedNextLine !== -1) {
          return scope.forcedNextLine;
        }
        var index = -1;
        scope.lines.every(function(line, lineIndex){
          if(!line.isSet) {
            index = lineIndex;
            return false;
          }
          return true;
        });
        return index;
      };

      function setPoint(point) {
        if(typeof(scope.pointsPerLine[point.name]) !== 'undefined') {
          scope.lines[scope.pointsPerLine[point.name].line].points[scope.pointsPerLine[point.name].point] = point;
        } else if (scope.plottedPoint.name === point.name) {
          scope.plottedPoint = point;
        } else {
          // if it's a new point
          // and there was already a plotted point
          if(scope.plottedPoint.name) {

            // add line
            var nextLine = scope.nextLine();
            var line = scope.lines[nextLine];
            line.points.A = scope.plottedPoint;
            line.points.B = point;
            line.points.A.isSet = line.points.B.isSet = true;

            // create line on graph
            if(!line.isSet) {

              var slope = (scope.plottedPoint.y - point.y) / (scope.plottedPoint.x - point.x);
              var yintercept = scope.plottedPoint.y - (scope.plottedPoint.x * slope);

              scope.graphCallback({
                drawShape: {
                  line: [scope.plottedPoint.name, point.name],
                  name: line.name
                }
              });

              // map points per line
              scope.pointsPerLine[scope.plottedPoint.name] = { line: nextLine, point: 'A'};
              scope.pointsPerLine[point.name] = { line: nextLine, point: 'B'};

              // delete plotted point
              scope.plottedPoint = {};

              // set line as plotted
              line.isSet = true;
            }
          } else {
            // if no plotted point, set it
            scope.plottedPoint = point;
          }
        }
      }

      // set initial state for the graph
      scope.startOver = function() {

        function getPoint(point) {
          return { x: point[0], y: point[1] };
        }
        function createInitialPoints(initialLine) {

          var initialValues = lineUtils.pointsFromEquation(initialLine,
            scope.graphAttrs.domainMin,
            scope.graphCallback.domainStepValue);

          if (typeof initialValues !== 'undefined') {
            scope.graphCallback({ add: { point: getPoint(initialValues[0]) } });
            scope.graphCallback({ add: { point: getPoint(initialValues[1]) } });
          }
        }

        // clean scope properties
        scope.plottedPoint = {};
        scope.lines = [];
        scope.pointsPerLine = {};
        _.each(scope.config.lines, function(line, index){
          scope.lines.push({
            id: line.id,
            name: line.label,
            points: { A: { isSet: false }, B: { isSet: false } },
            isSet: false
          });
          scope.forcedNextLine = index;
          createInitialPoints(line.intialLine);
        });
        scope.forcedNextLine = -1;
      };

      scope.pointUpdate = function(point) {
        scope.graphCallback({
          update: {
            points: [
              point
            ]
          }
        });
      };

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

          scope.graphAttrs = createGraphAttributes(config);
          scope.showInputs = config.showInputs;

          graphContainer.attr(scope.graphAttrs);
          graphContainer.css({
            width: containerWidth,
            height: containerHeight
          });
          scope.containerWidth = containerWidth;
          scope.containerHeight = containerHeight;
          $compile(graphContainer)(scope);

          // this timeout is needed to wait for the callback to be defined
          $timeout(function() {

            if(scope.graphCallback) {
              scope.startOver();
            }
          }, 100);
        },

        getSession: function() {
          return {
          };
        },

        setResponse: function(response) {
          if (!response) {
            return;
          }
        },

        setMode: function(newMode) {},

        reset: function() {},

        isAnswerEmpty: function() {
          return false;
        },

        answerChangedHandler: function(callback) {

        },

        editable: function(e) {
          scope.editable = e;
        }

      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    }

    function template() {
      return [
        "<div class='multiple-line-interaction-view'>",
        "  <div class='graph-interaction'>",
        "    <div class='graph-controls container-fluid' ng-show='showInputs'>",
        "      <div class='row line' ng-repeat='line in lines'>",
        "        <div class='col-md-12'>",
        "          <div class='row'>",
        "            <div class='col-sm-2'>{{line.name}}</div>",
        "            <div class='col-sm-1'>{{line.points.A.name}}</div>",
        "            <div class='col-sm-2'>",
        "              <label>x: </label>",
        "              <input type='number' ng-style='inputStyle', ng-model='line.points.A.x' ng-disabled='locked || line.points.A.x === undefined' ng-change='pointUpdate(line.points.A)'>",
        "            </div>",
        "            <div class='col-sm-2'>",
        "              <label>y: </label>",
        "              <input type='number' ng-style='inputStyle', ng-model='line.points.A.y' ng-disabled='locked || line.points.A.y === undefined' ng-change='pointUpdate(line.points.A)'>",
        "            </div>",
        "            <div class='col-sm-1'>{{line.points.B.name}}</div>",
        "            <div class='col-sm-2'>",
        "              <label>x: </label>",
        "              <input type='number' ng-style='inputStyle', ng-model='line.points.B.x' ng-disabled='locked || line.points.B.x === undefined' ng-change='pointUpdate(line.points.B)'>",
        "            </div>",
        "            <div class='col-sm-2'>",
        "              <label>y: </label>",
        "              <input type='number' ng-style='inputStyle', ng-model='line.points.B.y' ng-disabled='locked || line.points.B.y === undefined' ng-change='pointUpdate(line.points.B)'>",
        "            </div>",
        "          </div>",
        "        </div>",
        "      </div>",
        "    </div>",
        "    <div id='graph-container' class='row-fluid graph-container'></div>",
        "  </div>",
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