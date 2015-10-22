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

      scope.symbols = {
        0: 'circle',
        1: 'square',
        2: 'diamond',
        3: 'cross',
        4: 'plus',
        'exhibit': 'circle'
      };

      scope.fa_symbols = {
        0: 'circle',
        1: 'stop',
        2: 'stop diamond',
        3: 'times',
        4: 'plus',
        'exhibit': 'circle'
      };

      scope.inputStyle = {
        width: "50px"
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
          domainSnapFrequency: parseFloat(getModelValue(config.domainSnapFrequency, 1)),
          domainLabelFrequency: parseFloat(getModelValue(config.domainLabelFrequency, 1, config.tickLabelFrequency), 10),
          domainGraphPadding: parseInt(getModelValue(config.domainGraphPadding, 50), 10),
          rangeLabel: config.rangeLabel,
          rangeMin: parseFloat(getModelValue(config.rangeMin, -10, config.range * -1)),
          rangeMax: parseFloat(getModelValue(config.rangeMax, 10, config.range * 1)),
          rangeStepValue: parseFloat(getModelValue(config.rangeStepValue, 1)),
          rangeSnapFrequency: parseFloat(getModelValue(config.rangeSnapFrequency, 1)),
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
            scope.history.push({ action: 'move', previousPoint: _.cloneDeep(scope.lines[scope.pointsPerLine[point.name].line].points[scope.pointsPerLine[point.name].point]) });
          }

          var linePoint = scope.lines[scope.pointsPerLine[point.name].line].points[scope.pointsPerLine[point.name].point];
          linePoint.x = point.x;
          linePoint.y = point.y;
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
                points: [scope.plottedPoint.name, point.name],
                color: scope.colorPalette[line.colorIndex],
                symbol: scope.symbols[line.colorIndex]
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
            scope.graphAttrs.domainStepValue * scope.graphAttrs.domainSnapFrequency);

          if (typeof initialValues !== 'undefined') {
            scope.graphCallback({ add: { point: getPoint(initialValues[0]), triggerCallback: true  } });
            scope.graphCallback({ add: { point: getPoint(initialValues[1]), triggerCallback: true } });
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
          var line;

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
              line = scope.lines[scope.pointsPerLine[lastRecord.point.name].line];

              // remove point and line from graph
              scope.graphCallback({
                remove: { point: line.points.B, line: line.id }
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
            case 'remove_line':

              line = lastRecord.line;
              // recreate points
              scope.graphCallback({ add: { point: line.points.A, color: scope.colorPalette[line.colorIndex], name: line.points.A.name } });
              scope.graphCallback({ add: { point: line.points.B, color: scope.colorPalette[line.colorIndex], name: line.points.B.name } });

              // recreate the line, timeout is required to make sure the points are already created
              scope.graphCallback({
                drawShape: {
                  id: lastRecord.line.id,
                  line: [lastRecord.line.points.A.name, lastRecord.line.points.B.name],
                  label: lastRecord.line.name,
                  color: scope.colorPalette[lastRecord.line.colorIndex]
                }
              });

              // reset line in array
              scope.lines[lastRecord.lineIndex] = lastRecord.line;

              // map points per line
              scope.pointsPerLine[lastRecord.line.points.A.name] = { line: lastRecord.lineIndex, point: 'A'};
              scope.pointsPerLine[lastRecord.line.points.B.name] = { line: lastRecord.lineIndex, point: 'B'};
              break;
          }
        }
      };

      scope.pointUpdate = function(point, oldPoint) {
        if(oldPoint) {
          scope.history.push({ action: 'move', previousPoint: oldPoint });
        }

        scope.graphCallback({
          update: {
            point: point
          }
        });

        setPoint(point, false);
      };

      scope.lockGraph = function(color) {
        scope.locked = true;
        var options = {
          lockGraph: true
        };

        if(color) {
          options.pointsStyle = scope.config.exhibitOnly ? scope.colorPalette.exhibit : color;
          options.shapesStyle = scope.config.exhibitOnly ? scope.colorPalette.exhibit : color;
        }

        if (scope.graphCallback) {
          scope.graphCallback(options);
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

      scope.removeLine = function(lineId) {
        var line = getLineById(lineId);
        scope.history.push({ action: 'remove_line', line: _.cloneDeep(line), lineIndex: scope.lines.indexOf(line) });

        scope.graphCallback({
          remove: {
            points: [line.points.A, line.points.B],
            line: line.id
          }
        });

        // deletes the points-line mapping
        delete scope.pointsPerLine[line.points.A.name];
        delete scope.pointsPerLine[line.points.B.name];

        // deletes the line
        line.points.A = line.points.B = { isSet: false };
        line.isSet = false;
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

              solutionGraphCallback({
                drawShape: {
                  id: line.id,
                  curve: function(x) {
                    return eval(line.expression);
                  },
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

      var getLineById = function(lineId) {
        return _.find(scope.lines, function(line){
          return line.id === lineId;
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
          };

          scope.feedback = response && response.feedback;
          scope.response = response;
          scope.correctClass = response.correctness;

          if (response && response.correctness !== 'warning') {
            scope.inputStyle = _.extend(scope.inputStyle, {
              border: 'thin solid ' + color[(response && response.correctness) || "none"]
            });

            if (response.correctness === "partial" || response.correctness === "incorrect") {
              scope.correctResponse = response.correctResponse;

              if (response.correctResponse) {
                renderSolution(response);
              }
            }
          }

          scope.lockGraph();

          _.each(response.correctResponse, function(line){
            scope.graphCallback({
              shapeColor: {
                shape: line.id,
                color: line.isCorrect ? color.correct : color.incorrect
              }
            });
          });
        },

        setMode: function(newMode) {},

        reset: function() {
          scope.feedback = undefined;
          scope.response = undefined;
          scope.correctClass = undefined;
          scope.unlockGraph();

          scope.inputStyle = {
            width: "50px"
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
        "    <div class='undo-start-over-controls container-fluid'>",
        "      <div class='row'>",
        "        <div class='col-md-12'>",
        "          <span cs-start-over-button class='btn-player pull-right' ng-class='{disabled: locked || history.length < 1}' ng-disabled='locked || history.length < 1'></span>",
        "          <span cs-undo-button class='pull-right' ng-class='{disabled: locked || history.length < 1}' ng-disabled='locked || history.length < 1'></span>",
        "          <div class='clearfix'> </div>",
        "          <div class='clearfix'> </div>",
        "        </div>",
        "      </div>",
        "    </div><br/>",
        "    <div class='graph-controls container-fluid' ng-show='showInputs'>",
        "      <div class='row line-input' ng-repeat='line in lines' ng-if='!locked && line.points.A.x !== undefined && line.points.B.x !== undefined'>",
        "        <div class='col-sm-3'>",
        "          <span class='fa fa-{{fa_symbols[line.colorIndex % 5]}} symbol line{{ line.colorIndex % 5 }}'></span>",
        "          <span class='line-label'>{{line.name}}</span>",
        "        </div>",
        "        <div class='col-sm-9'>",
        "          <div class='point-input pull-left'>",
        "            <span class='point-label'>{{line.points.A.name}}</span>",
        "            <label>x: </label>",
        "            <input type='number' ng-style='inputStyle' ng-model='line.points.A.x' ng-change='pointUpdate(line.points.A, {{ line.points.A }})' ng-class='{ \"glowing-border\": isLineHovered(line.id) }' class='line{{ line.colorIndex % 5 }}' step='{{ graphAttrs.domainStepValue * graphAttrs.domainSnapFrequency }}'>",
        "            <label>y: </label>",
        "            <input type='number' ng-style='inputStyle', ng-model='line.points.A.y' ng-change='pointUpdate(line.points.A, {{ line.points.A }})' ng-class='{ \"glowing-border\": isLineHovered(line.id) }' class='line{{ line.colorIndex % 5 }}' step='{{ graphAttrs.rangeStepValue * graphAttrs.rangeSnapFrequency }}'>",
        "          </div>",
        "          <div class='point-input pull-right'>",
        "            <span class='point-label'>{{line.points.B.name}}</span>",
        "            <label>x: </label>",
        "            <input type='number' ng-style='inputStyle', ng-model='line.points.B.x' ng-change='pointUpdate(line.points.B, {{ line.points.B }})' ng-class='{ \"glowing-border\": isLineHovered(line.id) }' class='line{{ line.colorIndex % 5 }}' step='{{ graphAttrs.domainStepValue * graphAttrs.domainSnapFrequency }}'>",
        "            <label>y: </label>",
        "            <input type='number' ng-style='inputStyle', ng-model='line.points.B.y' ng-change='pointUpdate(line.points.B, {{ line.points.B }})' ng-class='{ \"glowing-border\": isLineHovered(line.id) }' class='line{{ line.colorIndex % 5 }}' step='{{ graphAttrs.rangeStepValue * graphAttrs.rangeSnapFrequency }}'>",
        "          <a class='btn delete-line-button' ng-disabled='locked || line.points.A.x === undefined || line.points.B.x === undefined' ng-click='removeLine(line.id)'><span class='fa fa-trash-o'></span></a>",
        "          </div>",
        "        </div>",
        "      </div>",
        "    </div>",
        "    <div id='graph-container' class='row-fluid graph-container'></div>",
        "  </div>",
        "  <div class='feedback-holder' ng-show='config.showFeedback'>",
        "    <div ng-show='feedback' feedback='feedback' correct-class='{{correctClass}}'></div>",
        "  </div>",
        "  <div see-answer-panel see-answer-panel-expanded='true' class='solution-panel' ng-class='{panelVisible: correctResponse}'>",
        "    <div class='solution-container'>",
        "      <div ng-repeat='response in correctResponse'><span ng-show='response.label'>{{ response.label }}: </span>{{response.equation}}</div>",
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