/* jshint evil: true */
var main = [
  '$compile',
  '$rootScope',
  '$timeout',
  "LineUtils",
  'CanvasTemplates',
  function($compile, $rootScope, $timeout, LineUtils, CanvasTemplates) {

    var lineUtils = new LineUtils();

    var colors = {
      correct: "#3c763d",
      partial: "#3a87ad",
      incorrect: "#eea236",
      warning: "#999999",
      none: ""
    };

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

      scope.interactionCallback = function(params) {
        setPoint(params.point);
      };

      scope.nextLine = function() {
        if (scope.forcedNextLine !== -1) {
          return scope.forcedNextLine;
        }
        var index = -1;
        scope.lines.every(function(line, lineIndex) {
          if (!line.isSet) {
            index = lineIndex;
            return false;
          }
          return true;
        });
        return index;
      };

      function setPoint(point, trackHistory) {

        trackHistory = (typeof trackHistory !== 'undefined') ? trackHistory : true;

        if (typeof(scope.pointsPerLine[point.name]) !== 'undefined') {
          if (trackHistory) {
            scope.history.push({
              action: 'move',
              previousPoint: _.cloneDeep(scope.lines[scope.pointsPerLine[point.name].line].points[scope.pointsPerLine[point.name].point])
            });
          }

          var linePoint = scope.lines[scope.pointsPerLine[point.name].line].points[scope.pointsPerLine[point.name].point];
          linePoint.x = point.x;
          linePoint.y = point.y;
          setLineEquation(scope.lines[scope.pointsPerLine[point.name].line]);
        } else if (scope.plottedPoint.name === point.name) {
          if (trackHistory) {
            scope.history.push({action: 'move', previousPoint: scope.plottedPoint});
          }
          scope.plottedPoint = point;
        } else {
          // if it's a new point
          // and there was already a plotted point
          if (scope.plottedPoint.name) {
            if (trackHistory) {
              scope.history.push({action: 'add_line', point: point});
            }

            setLine(point);

          } else {
            // if no plotted point, set it
            scope.plottedPoint = point;
            if (trackHistory) {
              scope.history.push({action: 'add_point', point: point});
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
        if (!line.isSet) {
          scope.graphCallback({
            pointColor: {
              points: [scope.plottedPoint.name, point.name],
              color: scope.colorPalette[line.colorIndex],
              symbol: scope.symbols[line.colorIndex]
            }
          });

          scope.graphCallback({
            drawShape: {
              id: line.id,
              line: [scope.plottedPoint.name, point.name],
              label: line.name,
              color: scope.colorPalette[line.colorIndex]
            }
          });

          // map points per line
          scope.pointsPerLine[scope.plottedPoint.name] = {line: nextLine, point: 'A'};
          scope.pointsPerLine[point.name] = {line: nextLine, point: 'B'};

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
          return {x: point[0], y: point[1]};
        }

        function createInitialPoints(initialLine) {

          var initialValues = lineUtils.pointsFromEquation(initialLine, scope.graphAttrs);

          if (typeof initialValues !== 'undefined') {
            scope.graphCallback({add: {point: getPoint(initialValues[0]), triggerCallback: true}});
            scope.graphCallback({add: {point: getPoint(initialValues[1]), triggerCallback: true}});
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

        _.each(scope.config.lines, function(line, index) {
          scope.lines.push({
            id: line.id,
            name: line.label,
            colorIndex: line.colorIndex,
            points: {A: {isSet: false}, B: {isSet: false}},
            equation: "",
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

          switch (lastRecord.action) {
            case 'move':
              scope.pointUpdate(lastRecord.previousPoint);
              break;
            case 'add_point':
              scope.undoAddPoint(lastRecord.point);
              break;
            case 'add_line':
              scope.undoAddLine(lastRecord.point);
              break;
            case 'remove_line':
              scope.undoRemoveLine(lastRecord.line, lastRecord.lineIndex);
              break;
          }
        }
      };

      scope.undoAddPoint = function(point) {
        scope.graphCallback({
          remove: {point: point}
        });
        scope.plottedPoint = {};
      };

      scope.undoAddLine = function(point) {
        var line = scope.lines[scope.pointsPerLine[point.name].line];

        // remove point and line from graph
        scope.graphCallback({
          remove: {point: line.points.B, line: line.id}
        });

        // set the new plottedPoint
        scope.plottedPoint = line.points.A;

        // deletes the points-line mapping
        delete scope.pointsPerLine[line.points.A.name];
        delete scope.pointsPerLine[line.points.B.name];

        // deletes the line
        line.points.A = line.points.B = {isSet: false};
        line.isSet = false;
      };

      scope.undoRemoveLine = function(line, lineIndex) {
        // recreate points
        scope.graphCallback({
          add: {
            point: line.points.A,
            color: scope.colorPalette[line.colorIndex],
            name: line.points.A.name
          }
        });
        scope.graphCallback({
          add: {
            point: line.points.B,
            color: scope.colorPalette[line.colorIndex],
            name: line.points.B.name
          }
        });

        // recreate the line, timeout is required to make sure the points are already created
        scope.graphCallback({
          drawShape: {
            id: line.id,
            line: [line.points.A.name, line.points.B.name],
            label: line.name,
            color: scope.colorPalette[line.colorIndex]
          }
        });

        // reset line in array
        scope.lines[lineIndex] = line;

        // map points per line
        scope.pointsPerLine[line.points.A.name] = {line: lineIndex, point: 'A'};
        scope.pointsPerLine[line.points.B.name] = {line: lineIndex, point: 'B'};
      };

      scope.pointUpdate = function(point, oldPoint) {
        if (oldPoint) {
          scope.history.push({action: 'move', previousPoint: oldPoint});
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

        if (color) {
          options.pointsStyle = scope.config.exhibitOnly ? scope.colorPalette.exhibit : color;
          options.shapesStyle = scope.config.exhibitOnly ? scope.colorPalette.exhibit : color;
        }

        if (scope.graphCallback) {
          scope.graphCallback(options);
        }

        _.each(scope.lines, function(line) {
          scope.graphCallback({
            shapeColor: {
              shape: line.id,
              color: '#bebebe'
            }
          });
        });

      };

      scope.unlockGraph = function() {
        scope.locked = false;
        if (_.isFunction(scope.graphCallback)) {
          scope.graphCallback({
            graphStyle: {},
            unlockGraph: true
          });
          _.each(scope.lines, function(line) {
            scope.graphCallback({
              shapeColor: {
                shape: line.id,
                color: scope.colorPalette[line.colorIndex]
              }
            });
          });

        }
      };

      scope.removeLine = function(lineId) {
        var line = getLineById(lineId);
        scope.history.push({action: 'remove_line', line: _.cloneDeep(line), lineIndex: scope.lines.indexOf(line)});

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
        line.points.A = line.points.B = {isSet: false};
        line.equation = "";
        line.isSet = false;
      };

      scope.isLineHovered = function(lineId) {
        return lineId === scope.hoveredLine;
      };

      function renderSolution(response) {
        var solutionScope = scope.$new();
        var solutionContainer = element.find('.solution-graph');
        var solutionGraphAttrs = scope.createGraphAttributes(scope.config, scope.config.lines.length * 2, "graphCallbackSolution");
        solutionGraphAttrs.showPoints = false;
        solutionGraphAttrs.showLabels = false;

        solutionContainer.attr(solutionGraphAttrs);
        solutionContainer.css({
          width: Math.min(scope.containerWidth, 500),
          height: Math.min(scope.containerHeight, 500)
        });
        solutionScope.interactionCallback = function() {
        };

        solutionScope.$watch('graphCallbackSolution', function(solutionGraphCallback) {
          if (solutionGraphCallback) {
            _.each(response.correctResponse, function(line) {
              solutionGraphCallback({
                drawShape: {
                  id: line.id,
                  curve: function(x) {
                    return eval(line.expression) || 0;
                  },
                  label: line.label,
                  color: colors.correct
                },
                lockGraph: true
              });
            });
          }
        });

        $compile(solutionContainer)(solutionScope);
      }

      var getLineById = function(lineId) {
        return _.find(scope.lines, function(line) {
          return line.id === lineId;
        });
      };

      function showCorrectAnswer() {
        scope.graphCallback({
          clearBoard: true
        });


        _.each(scope.instructorData.correctResponse, function(line) {
          var cr = lineUtils.expressionize(line.equation, "x");
          scope.graphCallback({
            drawShape: {
              curve: function(x) {
                return eval(cr);
              },
              color: colors.correct,
              label: line.label
            }
          });
        });
      }

      scope.renderInitialGraph = function(){
        if (scope.instructorData) {
          showCorrectAnswer();
        } else {
          if (scope.graphCallback) {
            scope.startOver();
          }

          // lock/unlock the graph
          if (scope.config.exhibitOnly || scope.editable === false) {
            scope.lockGraph();
          } else {
            scope.unlockGraph();
          }
        }
      };

      scope.containerBridge = {

        setPlayerSkin: function(skin) {
          scope.iconset = skin.iconSet;
          console.log('skin', skin);
          function setColor(source, target) {
            if (skin.colors && skin.colors[source]) {
              colors[target] = skin.colors[source];
            }
          }

          setColor('correct-background', 'correct');
          setColor('incorrect-background', 'incorrect');
          setColor('warning-background', 'warning');
        },

        setDataAndSession: function(dataAndSession) {

          CanvasTemplates.extendScope(scope, 'corespring-multiple-line');

          var config = dataAndSession.data.model.config || {};
          scope.config = _.defaults(config, {
            showFeedback: true
          });

          var containerWidth, containerHeight;
          var graphContainer = element.find('.graph-container');

          containerWidth = parseInt(config.graphWidth, 10) || 500;
          containerHeight = parseInt(config.graphHeight, 10) || 500;
          scope.containerWidth = containerWidth || 500;
          scope.containerHeight = containerHeight || 500;

          scope.graphAttrs = scope.createGraphAttributes(config, scope.config.lines.length * 2);
          scope.showInputs = config.showInputs;

          graphContainer.attr(scope.graphAttrs);
          graphContainer.css({
            width: containerWidth,
            height: containerHeight
          });
          graphContainer.parents('.graph-group').css({
            width: scope.containerWidth,
            height: scope.containerHeight + 100
          });

          $compile(graphContainer)(scope);

          if (dataAndSession.session && dataAndSession.session.answers) {
            scope.config.lines = _.map(dataAndSession.session.answers, function(a, idx) {
              return {
                id: a.id,
                label: a.name,
                intialLine: a.equation,
                colorIndex: idx
              };
            });
          }

          var removeGraphCallbackWatch = scope.$watch('graphCallback', function(n){
            if(n){
              removeGraphCallbackWatch();
              $timeout(scope.renderInitialGraph, 50);
            }
          });
        },

        getSession: function() {
          var lines = _.map(scope.lines, function(line) {
            return {id: line.id, equation: line.equation, name: line.name};
          });
          return {
            answers: lines
          };
        },

        setInstructorData: function(data) {
          scope.instructorData = data;
          showCorrectAnswer();
        },

        setResponse: function(response) {
          if (!response) {
            return;
          }

          scope.feedback = response && response.feedback;
          scope.response = response;
          scope.correctClass = response.correctness;

          if (response && response.correctness !== 'warning') {
            scope.inputStyle = _.extend(scope.inputStyle, {
              border: 'thin solid ' + colors[(response && response.correctness) || "none"]
            });

            if (response.correctness === "partial" || response.correctness === "incorrect") {
              scope.correctResponse = response.correctResponse;

              if (response.correctResponse) {
                renderSolution(response);
              }
            }
          }

          scope.lockGraph();

          _.each(response.correctResponse, function(line) {
            var isCorrect = response.correctness === "correct" || line.isCorrect;
            scope.graphCallback({
              shapeColor: {
                shape: line.id,
                color: isCorrect ? colors.correct : colors.incorrect
              }
            });
          });
        },

        setMode: function(newMode) {
        },

        reset: function() {
          scope.feedback = undefined;
          scope.response = undefined;
          scope.instructorData = undefined;
          scope.correctClass = undefined;
          scope.unlockGraph();

          scope.inputStyle = {
            width: "50px"
          };

          var solutionContainer = element.find('.solution-graph');
          solutionContainer.empty();

          scope.correctResponse = undefined;
          scope.lines = [];
          scope.isSeeAnswerPanelExpanded = false;

          scope.startOver();
        },

        isAnswerEmpty: function() {
          var answer = this.getSession().answers;
          var answersGiven = 0;
          _.each(answer, function(line) {
            if (line.equation !== undefined && line.equation !== null && line.equation !== "") {
              answersGiven++;
            }
          });
          return _.isUndefined(answer) || _.isEmpty(answer) || answersGiven === 0;
        },

        answerChangedHandler: function(callback) {

        },

        editable: function(e) {
          scope.editable = e;
          if(e) {
            scope.unlockGraph();
          } else {
            scope.lockGraph();
          }
        }

      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    }

    function template() {
      return [
        "<div class='multiple-line-interaction-view'>",
        "  <div class='graph-interaction'>",
        "    <div class='undo-start-over-controls container-fluid' ng-hide='config.exhibitOnly || locked'>",
        "      <div class='row'>",
        "        <div class='col-md-12 text-center' ng-hide='response'>",
        "          <span cs-start-over-button class='btn-player' ng-class='{disabled: locked || history.length < 1}' ng-disabled='locked || history.length < 1'></span>",
        "          <span cs-undo-button ng-class='{disabled: locked || history.length < 1}' ng-disabled='locked || history.length < 1'></span>",
        "          <div class='clearfix'> </div>",
        "        </div>",
        "      </div>",
        "    </div><br/>",
        "    <div ng-if='instructorData' ng-repeat='response in instructorData.correctResponse'><span ng-show='response.label'>{{ response.label }}: </span>y={{response.equation}}</div>",
        '    <correct-answer-toggle ng-if="correctResponse" visible="correctResponse" toggle="$parent.isSeeAnswerPanelExpanded"></correct-answer-toggle>',
        "    <div class='graph-controls container-fluid' ng-show='showInputs' ng-hide='config.exhibitOnly'>",
        "      <div class='row line-input' ng-repeat='line in lines' ng-if='!locked && line.points.A.x !== undefined && line.points.B.x !== undefined'>",
        "        <div class='col-sm-3'>",
        "          <span class='fa fa-{{fa_symbols[line.colorIndex % 5]}} symbol line{{ line.colorIndex % 5 }}'></span>",
        "          <span class='line-label'>{{line.name}}</span>",
        "        </div>",
        "        <div class='col-sm-9'>",
        "          <div class='point-input pull-left'>",
        "            <span class='point-label'>{{line.points.A.name}}</span>",
        "            <label>x: </label>",
        "            <input type='number' ng-style='inputStyle' ng-model='line.points.A.x' ",
        "               ng-disabled='locked || line.points.A.x === undefined' ",
        "               ng-change='pointUpdate(line.points.A, {{ line.points.A }})' ",
        "               ng-class='{ \"glowing-border\": isLineHovered(line.id) }' ",
        "               class='line{{ line.colorIndex % 5 }}' ",
        "               step='{{ graphAttrs.domainSnapValue }}'>",
        "            <label>y: </label>",
        "            <input type='number' ng-style='inputStyle', ng-model='line.points.A.y' ",
        "               ng-disabled='locked || line.points.A.y === undefined' ",
        "               ng-change='pointUpdate(line.points.A, {{ line.points.A }})' ",
        "               ng-class='{ \"glowing-border\": isLineHovered(line.id) }' ",
        "               class='line{{ line.colorIndex % 5 }}' ",
        "               step='{{ graphAttrs.rangeSnapValue }}'>",
        "          </div>",
        "          <div class='point-input pull-right'>",
        "            <span class='point-label'>{{line.points.B.name}}</span>",
        "            <label>x: </label>",
        "            <input type='number' ng-style='inputStyle', ng-model='line.points.B.x' ",
        "               ng-disabled='locked || line.points.B.x === undefined' ",
        "               ng-change='pointUpdate(line.points.B, {{ line.points.B }})' ",
        "               ng-class='{ \"glowing-border\": isLineHovered(line.id) }' ",
        "               class='line{{ line.colorIndex % 5 }}' ",
        "               step='{{ graphAttrs.domainSnapValue }}'>",
        "            <label>y: </label>",
        "            <input type='number' ng-style='inputStyle', ng-model='line.points.B.y' ",
        "               ng-disabled='locked || line.points.B.y === undefined' ",
        "               ng-change='pointUpdate(line.points.B, {{ line.points.B }})' ",
        "               ng-class='{ \"glowing-border\": isLineHovered(line.id) }' ",
        "               class='line{{ line.colorIndex % 5 }}' ",
        "               step='{{ graphAttrs.rangeSnapValue }}'>",
        "          <a class='btn delete-line-button' ng-disabled='locked || line.points.A.x === undefined || line.points.B.x === undefined' ng-click='removeLine(line.id)'><span class='fa fa-trash-o'></span></a>",
        "          </div>",
        "        </div>",
        "      </div>",
        "    </div>",

        "    <div class='graph-group'>",
        "      <div class='graph-group-element' ng-class='{graphShown: !isSeeAnswerPanelExpanded}'>",
        "        <div id='graph-container' class='graph-container'></div>",
        "      </div>",
        "      <div class='graph-group-element' ng-class='{graphShown: isSeeAnswerPanelExpanded}'>",
        "        <div class='solution-graph'></div>",
        "      </div>",
        "    </div>",
        "    <div class='correct-legend' ng-if='isSeeAnswerPanelExpanded'>",
        "      <div ng-repeat='response in correctResponse'><span ng-show='response.label'>{{ response.label }}: </span>y={{response.equation}}</div>",
        "    </div>",
        "  </div>",
        "  <div class='feedback-holder' ng-show='config.showFeedback'>",
        "    <div ng-show='feedback' feedback='feedback' icon-set='{{iconset}}' correct-class='{{correctClass}}'></div>",
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
