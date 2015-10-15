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
      scope.hoveredLine = -1;

      scope.history = [];
      scope.colorPalette = {
        0: '#993399',
        1: '#0033ff',
        2: '#666633',
        3: '#ffcc99',
        4: '#663333',
        'exhibit': '#000000'
      };

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
          "hovered-line": "hoveredLine",
          maxPoints: scope.config.lines.length * 2,
          domainLabel: config.domainLabel,
          domainMin: parseFloat(getModelValue(config.domainMin, -10, config.domain * -1), 10),
          domainMax: parseFloat(getModelValue(config.domainMax, 10, config.domain), 10),
          domainStepValue: parseFloat(getModelValue(config.domainStepValue, 1)),
          domainSnapValue: parseFloat(getModelValue(config.domainSnapValue, 1)),
          domainLabelFrequency: parseFloat(getModelValue(config.domainLabelFrequency, 1, config.tickLabelFrequency), 10),
          domainGraphPadding: parseInt(getModelValue(config.domainGraphPadding, 50), 10),
          rangeLabel: config.rangeLabel,
          rangeMin: parseFloat(getModelValue(config.rangeMin, -10, config.range * -1)),
          rangeMax: parseFloat(getModelValue(config.rangeMax, 10, config.range * 1)),
          rangeStepValue: parseFloat(getModelValue(config.rangeStepValue, 1)),
          rangeSnapValue: parseFloat(getModelValue(config.rangeSnapValue, 1)),
          rangeLabelFrequency: parseFloat(getModelValue(config.rangeLabelFrequency, 1, config.tickLabelFrequency, 10)),
          rangeGraphPadding: parseInt(getModelValue(config.rangeGraphPadding, 50), 10),
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

      function setPoint(point, trackHistory) {

        trackHistory = (typeof trackHistory !== 'undefined') ? trackHistory : true;

        if(typeof(scope.pointsPerLine[point.name]) !== 'undefined') {
          if(trackHistory) {
            scope.history.push({ action: 'move', previousPoint: scope.lines[scope.pointsPerLine[point.name].line].points[scope.pointsPerLine[point.name].point] });
          }

          scope.lines[scope.pointsPerLine[point.name].line].points[scope.pointsPerLine[point.name].point] = point;
          setLineEquation(scope.lines[scope.pointsPerLine[point.name].line]);
        } else if (scope.plottedPoint.name === point.name) {
          if(trackHistory) {
            scope.history.push({ action: 'move', previousPoint: scope.plottedPoint });
          }
          scope.plottedPoint = point;
        } else {
          // if it's a new point
          // and there was already a plotted point
          if(scope.plottedPoint.name) {
            if(trackHistory) {
              scope.history.push({ action: 'add_line', point: point });
            }

            setLine(point);

          } else {
            // if no plotted point, set it
            scope.plottedPoint = point;
            if(trackHistory) {
              scope.history.push({ action: 'add_point', point: point });
            }
          }
        }
      }

      function setLine(point) {
        // add line
        var nextLine = scope.nextLine();
        var line = scope.lines[nextLine];
        line.points.A = scope.plottedPoint;
        line.points.B = point;
        line.points.A.isSet = line.points.B.isSet = true;

        setLineEquation(line);

        // create line on graph
        if(!line.isSet) {
          if(!scope.config.exhibitOnly) {
            scope.graphCallback({
              pointColor: {
                point: scope.plottedPoint.name,
                color: scope.colorPalette[line.colorIndex]
              }
            });

            scope.graphCallback({
              pointColor: {
                point: point.name,
                color: scope.colorPalette[line.colorIndex]
              }
            });
          }

          scope.graphCallback({
            drawShape: {
              id: line.id,
              line: [scope.plottedPoint.name, point.name],
              label: line.name,
              color: scope.colorPalette[line.colorIndex]
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
      }

      function setLineEquation(line) {
        var slope = (line.points.B.y - line.points.A.y) / (line.points.B.x - line.points.A.x);
        var yintercept = line.points.B.y - (line.points.B.x * slope);
        line.equation = slope + "x+" + yintercept;
      }

      // set initial state for the graph
      scope.startOver = function() {

        function getPoint(point) {
          return { x: point[0], y: point[1] };
        }
        function createInitialPoints(initialLine) {

          var initialValues = lineUtils.pointsFromEquation(initialLine,
            scope.graphAttrs.domainMin,
            scope.graphAttrs.domainStepValue);

          if (typeof initialValues !== 'undefined') {
            scope.graphCallback({ add: { point: getPoint(initialValues[0]) } });
            scope.graphCallback({ add: { point: getPoint(initialValues[1]) } });
          }
        }

        // clear board
        scope.graphCallback({
          clearBoard: true
        });

        // clean scope properties
        scope.plottedPoint = {};
        scope.lines = [];
        scope.pointsPerLine = {};

        _.each(scope.config.lines, function(line, index){
          scope.lines.push({
            id: line.id,
            name: line.label,
            colorIndex: line.colorIndex,
            points: { A: { isSet: false }, B: { isSet: false } },
            isSet: false
          });
          scope.forcedNextLine = index;
          createInitialPoints(line.intialLine);
        });

        scope.forcedNextLine = -1;
        scope.history = [];
      };

      scope.undo = function() {
        if (!scope.locked && scope.history.length > 0) {
          var lastRecord = scope.history.pop();

          switch(lastRecord.action) {
            case 'move':
              scope.pointUpdate(lastRecord.previousPoint);
              break;
            case 'add_point':
              scope.graphCallback({
                remove: { point: lastRecord.point }
              });
              scope.plottedPoint = {};
              break;
            case 'add_line':
              var line = scope.lines[scope.pointsPerLine[lastRecord.point.name].line];

              // remove point and line from graph
              scope.graphCallback({
                remove: { point: line.points.B, line: true }
              });

              // set the new plottedPoint
              scope.plottedPoint = line.points.A;

              // deletes the points-line mapping
              delete scope.pointsPerLine[line.points.A.name];
              delete scope.pointsPerLine[line.points.B.name];

              // deletes the line
              line.points.A = line.points.B = { isSet: false };
              line.isSet = false;

              break;
          }
        }
      };

      scope.pointUpdate = function(point) {
        scope.graphCallback({
          update: {
            point: point
          }
        });

        setPoint(point, false);
      };

      scope.lockGraph = function(color) {
        scope.locked = true;
        if (scope.graphCallback) {
          scope.graphCallback({
            pointsStyle: scope.config.exhibitOnly ? scope.colorPalette.exhibit : color ? color : scope.colorPalette.exhibit,
            shapesStyle: scope.config.exhibitOnly ? scope.colorPalette.exhibit : color ? color : scope.colorPalette.exhibit,
            lockGraph: true
          });
        }
      };

      scope.unlockGraph = function() {
        scope.locked = false;
        if (_.isFunction(scope.graphCallback)) {
          scope.graphCallback({
            graphStyle: {},
            unlockGraph: true
          });
        }
      };

      scope.isLineHovered = function(lineId) {
        return lineId === scope.hoveredLine;
      };

      function renderSolution(response) {
        var solutionScope = scope.$new();
        var solutionContainer = element.find('.solution-graph');
        var solutionGraphAttrs = createGraphAttributes(scope.config, "graphCallbackSolution");
        solutionGraphAttrs.showPoints = false;
        solutionGraphAttrs.showLabels = false;

        solutionContainer.attr(solutionGraphAttrs);
        solutionContainer.css({
          width: Math.min(scope.containerWidth, 500),
          height: Math.min(scope.containerHeight, 500)
        });
        solutionScope.interactionCallback = function() {};

        solutionScope.$watch('graphCallbackSolution', function(solutionGraphCallback) {
          if (solutionGraphCallback) {
            _.each(response.correctResponse, function(line){

              var initialValues = lineUtils.pointsFromEquation(line.equation,
                solutionGraphAttrs.domainMin,
                solutionGraphAttrs.domainStepValue);

              var point1 = point2 = {};

              if (typeof initialValues !== 'undefined') {
                point1 = solutionGraphCallback({ add: { point: { x: initialValues[0][0], y: initialValues[0][1] } } });
                point2 = solutionGraphCallback({ add: { point: { x: initialValues[1][0], y: initialValues[1][1] } } });
              }

              solutionGraphCallback({
                drawShape: {
                  id: line.id,
                  line: [point1.name, point2.name],
                  label: line.label,
                  color: "#3C763D"
                },
                lockGraph: true
              });
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

            // lock/unlock the graph
            if (config.exhibitOnly) {
              scope.lockGraph();
            } else {
              scope.unlockGraph();
            }
          }, 100);
        },

        getSession: function() {
          return {
            answers: scope.lines
          };
        },

        setResponse: function(response) {
          if (!response) {
            return;
          }

          var color = {
            correct: "#3c763d",
            partial: "#3a87ad",
            incorrect: "#eea236",
            warning: "#999999",
            none: ""
          }[(response && response.correctness) || "none"];

          scope.feedback = response && response.feedback;
          scope.response = response;
          scope.correctClass = response.correctness;

          if (response && response.correctness !== 'warning') {
            scope.inputStyle = _.extend(scope.inputStyle, {
              border: 'thin solid ' + color
            });

            if (response.correctness === "partial" || response.correctness === "incorrect") {
              scope.correctResponse = response.correctResponse;

              if (response.correctResponse) {
                renderSolution(response);
              }
            }
          }

          scope.lockGraph(color);
        },

        setMode: function(newMode) {},

        reset: function() {
          scope.feedback = undefined;
          scope.response = undefined;
          scope.correctClass = undefined;
          scope.unlockGraph();

          scope.inputStyle = {
            width: "40px"
          };

          var solutionContainer = element.find('.solution-graph');
          solutionContainer.empty();

          scope.correctResponse = undefined;
          scope.lines = [];

          scope.startOver();
        },

        isAnswerEmpty: function() {
          var answer = this.getSession().answers;
          var answersGiven = 0;
          _.each(answer, function(line){
            if(line.equation !== undefined && line.equation !== null && line.equation !== "") {
              answersGiven++;
            }
          });
          return _.isUndefined(answer) || _.isEmpty(answer) || answersGiven === 0;
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
        "              <input type='number' ng-style='inputStyle' ng-model='line.points.A.x' ng-disabled='locked || line.points.A.x === undefined' ng-change='pointUpdate(line.points.A)' ng-class='{ \"glowing-border\": isLineHovered(line.id) }' class='line{{ line.colorIndex % 5 }}' >",
        "            </div>",
        "            <div class='col-sm-2'>",
        "              <label>y: </label>",
        "              <input type='number' ng-style='inputStyle', ng-model='line.points.A.y' ng-disabled='locked || line.points.A.y === undefined' ng-change='pointUpdate(line.points.A)' ng-class='{ \"glowing-border\": isLineHovered(line.id) }' class='line{{ line.colorIndex % 5 }}'>",
        "            </div>",
        "            <div class='col-sm-1'>{{line.points.B.name}}</div>",
        "            <div class='col-sm-2'>",
        "              <label>x: </label>",
        "              <input type='number' ng-style='inputStyle', ng-model='line.points.B.x' ng-disabled='locked || line.points.B.x === undefined' ng-change='pointUpdate(line.points.B)' ng-class='{ \"glowing-border\": isLineHovered(line.id) }' class='line{{ line.colorIndex % 5 }}'>",
        "            </div>",
        "            <div class='col-sm-2'>",
        "              <label>y: </label>",
        "              <input type='number' ng-style='inputStyle', ng-model='line.points.B.y' ng-disabled='locked || line.points.B.y === undefined' ng-change='pointUpdate(line.points.B)' ng-class='{ \"glowing-border\": isLineHovered(line.id) }' class='line{{ line.colorIndex % 5 }}'>",
        "            </div>",
        "          </div>",
        "        </div>",
        "      </div>",
        "      <div class='row line'>",
        "        <div class='col-md-12'>",
        "          <div class='action undo'>",
        "            <a title='Undo' ng-click='undo()'>",
        "              <i class='fa fa-undo'/>",
        "            </a>",
        "          </div>",
        "          <div class='action start-over'>",
        "            <a title='Start Over' ng-click='startOver()'>",
        "              <i class='fa fa-refresh'/>",
        "            </a>",
        "          </div>",
        "          <div class='clearfix'> </div>",
        "          <div class='clearfix'> </div>",
        "        </div>",
        "      </div>",
        "    </div>",
        "    <div id='graph-container' class='row-fluid graph-container'></div>",
        "  </div>",
        "  <div class='feedback-holder' ng-show='true'>",
        "    <div ng-show='feedback' feedback='feedback' correct-class='{{correctClass}}'></div>",
        "  </div>",
        "  <div see-answer-panel see-answer-panel-expanded='true' class='solution-panel' ng-class='{panelVisible: correctResponse}'>",
        "    <div class='solution-container'>",
        "      <div>The correct equations are:</div>",
        "      <div ng-repeat='response in correctResponse'><span ng-show='response.label'>- {{ response.label }}: </span>{{response.equation}}</div>",
        "      <div class='solution-graph'></div>",
        "    </div>",
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