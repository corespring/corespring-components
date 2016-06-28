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
      incorrect: "#eea236",
      warning: "#999999",
      none: ''
    };

    return {
      template: template(),
      restrict: 'AE',
      scope: true,
      link: link
    };

    function link(scope, element, attrs) {

      scope.history = [];
      scope.lineColor = '#993399';
      scope.exhibitColor = '#000000';

      scope.line = {
        id: 1,
        color: scope.lineColor,
        points: { A: { isSet: false }, B: { isSet: false } },
        isSet: false
      };

      scope.inputStyle = {
        width: "55px"
      };

      scope.interactionCallback = function(params) {
        setPoint(params.point);
      };

      function setPoint(point, trackHistory) {

        trackHistory = (typeof trackHistory !== 'undefined') ? trackHistory : true;

        if(scope.line.points[point.name].isSet) {
          if(trackHistory) {
            scope.history.push({ action: 'move', previousPoint: _.cloneDeep(scope.line.points[point.name]) });
          }

          scope.line.points[point.name].x = point.x;
          scope.line.points[point.name].y = point.y;
        } else {
          point.isSet = true;
          scope.line.points[point.name] = point;
          // if it's a new point
          if(trackHistory) {
            scope.history.push({ action: 'add_point', point: point });
          }
        }

        if(scope.line.points.A.isSet && scope.line.points.B.isSet) {
          setLine();
        }
      }

      function setLine() {
        // add line
        setLineEquation();

        // create line on graph
        if(!scope.line.isSet) {

          scope.graphCallback({
            pointColor: {
              points: [scope.line.points.A.name, scope.line.points.B.name],
              color: scope.lineColor
            }
          });

          scope.graphCallback({
            drawShape: {
              id: scope.line.id,
              line: [scope.line.points.A.name, scope.line.points.B.name],
              color: scope.lineColor
            }
          });

          // set line as plotted
          scope.line.isSet = true;
        }
      }

      function setLineEquation() {
        var slope = (scope.line.points.B.y - scope.line.points.A.y) / (scope.line.points.B.x - scope.line.points.A.x);
        var yintercept = scope.line.points.B.y - (scope.line.points.B.x * slope);
        scope.line.equation = slope + "x+" + yintercept;
      }

      // set initial state for the graph
      scope.startOver = function() {

        function getPoint(point) {
          return { x: point[0], y: point[1] };
        }

        function createInitialPoints(initialLine) {
          var initialValues = lineUtils.pointsFromEquation(initialLine, scope.graphAttrs.domainSnapValue);
          if (typeof initialValues !== 'undefined') {
            addInitialPoints({A: getPoint(initialValues[0]), B: getPoint(initialValues[1])});
          }
        }

        function addInitialPoints(initialPoints) {
          scope.graphCallback({ add: { point: initialPoints.A, triggerCallback: true  } });
          scope.graphCallback({ add: { point: initialPoints.B, triggerCallback: true } });

        }

        // clear board
        scope.graphCallback({
          clearBoard: true
        });

        // clean scope properties
        scope.line = {
          id: 1,
          color: scope.lineColor,
          points: { A: { isSet: false }, B: { isSet: false } },
          isSet: false
        };

        if (scope.config.initialPoints) {
          addInitialPoints(scope.config.initialPoints);
        } else if(scope.config.initialCurve) {
          createInitialPoints(scope.config.initialCurve);
        }

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
              // remove point and line from graph
              scope.graphCallback({
                remove: { point: lastRecord.point, line: scope.line.id }
              });
              // deletes the line
              scope.line.points[lastRecord.point.name] = { isSet: false };
              scope.line.isSet = false;
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
        if (scope.graphCallback) {
          scope.graphCallback({
            pointsStyle: scope.config.exhibitOnly ? scope.exhibitColor : color ? color : scope.exhibitColor,
            shapesStyle: scope.config.exhibitOnly ? scope.exhibitColor : color ? color : scope.exhibitColor,
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

      function renderSolution(response) {
        var solutionScope = scope.$new();
        var solutionContainer = element.find('.solution-graph');
        var solutionGraphAttrs = scope.createGraphAttributes(scope.config, 2, "graphCallbackSolution");
        solutionGraphAttrs.showPoints = false;
        solutionGraphAttrs.showLabels = false;

        solutionContainer.attr(solutionGraphAttrs);
        solutionContainer.css({
          width: scope.containerWidth,
          height: scope.containerHeight
        });
        solutionScope.interactionCallback = function() {};

        solutionScope.$watch('graphCallbackSolution', function(solutionGraphCallback) {
          if (solutionGraphCallback) {
            solutionGraphCallback({
              drawShape: {
                id: scope.line.id,
                curve: function(x) {
                  return eval(response.correctResponse.expression) || 0;
                },
                color: colors.correct
              },
              lockGraph: true
            });
          }
        });

        $compile(solutionContainer)(solutionScope);
      }

      function showCorrectAnswer() {
        if (!scope.instructorData) {
          return;
        }
        var cr = lineUtils.expressionize(scope.instructorData.correctResponse, "x");
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

        scope.containerBridge.setResponse({correctness: 'correct'});
      }

      scope.updateMode = function() {
        if (scope.mode === 'view') {
          scope.lockGraph('#bebebe');
        }
      };

      scope.containerBridge = {

        setPlayerSkin: function(skin) {
          scope.iconset = skin.iconSet;
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

          console.log('cw', containerWidth, config.graphWidth);


          scope.graphAttrs = scope.createGraphAttributes(config, 2);
          scope.showInputs = config.showInputs;
          scope.containerWidth = containerWidth || 500;
          scope.containerHeight = containerHeight || 500;

          graphContainer.attr(scope.graphAttrs);
          element.find('.graph-container, .solution-graph').css({
            width: scope.containerWidth,
            height: scope.containerHeight
          });
          graphContainer.parents('.graph-group').css({
            width: scope.containerWidth,
            height: scope.containerHeight
          });

          console.log('cicia', scope.containerWidth, scope.containerHeight);
          $compile(graphContainer)(scope);

          // The model changed in 67d8ab7 so we have to accomodate for both
          if (dataAndSession.session && dataAndSession.session.answers) {
            if (_.isString(dataAndSession.session.answers)) {
              scope.config.initialCurve = dataAndSession.session.answers;
            } else if (_.isObject(dataAndSession.session.answers)) {
              scope.config.initialPoints = dataAndSession.session.answers;
            }
          }

          // this timeout is needed to wait for the callback to be defined
          $timeout(function() {

            if (scope.instructorData) {
              showCorrectAnswer();
            } else {
              if (scope.graphCallback) {
                scope.startOver();
              }

              // lock/unlock the graph
              if (config.exhibitOnly) {
                scope.lockGraph();
              } else {
                scope.unlockGraph();
              }
              scope.updateMode();
            }
          }, 100);
        },

        getSession: function() {
          return {
            answers: scope.line.equation
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

          var color = colors[(response && response.correctness) || "none"];

          scope.feedback = response && response.feedback;
          scope.response = response;
          scope.correctClass = response.correctness;

          if (response && response.correctness !== 'warning') {
            scope.inputStyle = _.extend(scope.inputStyle, {
              border: 'thin solid ' + color
            });

            if (response.correctness === "incorrect") {
              scope.correctResponse = response.correctResponse;

              if (response.correctResponse) {
                renderSolution(response);
              }
            }
          }

          scope.lockGraph(color);
        },

        setMode: function(mode) {
          scope.mode = mode;
          scope.updateMode();
        },

        reset: function() {
          scope.feedback = undefined;
          scope.response = undefined;
          scope.instructorData = undefined;
          scope.correctClass = undefined;
          scope.unlockGraph();
          scope.isSeeAnswerPanelExpanded = false;

          scope.inputStyle = {
            width: "55px"
          };

          var solutionContainer = element.find('.solution-graph');
          solutionContainer.empty();

          scope.correctResponse = undefined;
          scope.line = {
            id: 1,
            color: scope.lineColor,
            points: { A: { isSet: false }, B: { isSet: false } },
            isSet: false
          };

          scope.startOver();
        },

        isAnswerEmpty: function() {
          var answer = this.getSession().answers;
          return _.isUndefined(answer) || _.isEmpty(answer);
        },

        answerChangedHandler: function(callback) {
          scope.$watch("line.equation", function (newValue, oldValue) {
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
        '  <correct-answer-toggle visible="correctResponse" toggle="isSeeAnswerPanelExpanded"></correct-answer-toggle>',

        "  <div class='graph-interaction'>",
        "    <div class='undo-start-over-controls container-fluid'>",
        "      <div class='row' ng-hide='config.exhibitOnly'>",
        "        <div class='col-md-12 text-center' ng-hide='response'>",
        "          <span cs-undo-button ng-class='{disabled: history.length < 1}' ng-disabled='history.length < 1'></span>",
        "          <span cs-start-over-button class='btn-player' ng-class='{disabled: history.length < 1}' ng-disabled='history.length < 1'></span>",
        "        </div>",
        "      </div>",
        "    </div><br/>",
        "    <div ng-if='instructorData'>{{instructorData.correctResponse}}</div>",
        "    <div class='graph-controls container-fluid' ng-show='showInputs'>",
        "      <div class='row points-input'>",
        "        <div class='col-sm-12'>",
        "          <div class='point-input pull-left'>",
        "            <span class='point-label'>Point A:</span>",
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
        "            <span class='point-label point-b'>Point B</span>",
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
        "    <div class='correct-legend' ng-if='isSeeAnswerPanelExpanded'>{{correctResponse.equation}}</div>",
        "  </div>",
        "  <div class='feedback-holder' ng-show='config.showFeedback' >",
        "  <div ng-show='feedback' feedback='feedback' icon-set='{{iconset}}' correct-class='{{correctClass}}'></div>",
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