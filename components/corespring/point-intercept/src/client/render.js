exports.framework = 'angular';
exports.directives = [
  {
    directive: [
      '$compile',
      '$modal',
      '$rootScope',
      'CanvasTemplates',
      'CsUndoModel',
      PlotPointsDirective
    ]
  }
];

function PlotPointsDirective(
  $compile,
  $modal,
  $rootScope,
  CanvasTemplates,
  CsUndoModel
) {

  var colors = {
    correct: '#3c763d',
    incorrect: '#EC971F',
    warning: '#999',
    none: ''
  };

  return {
    controller: ['$scope', controller],
    link: link,
    restrict: 'AE',
    scope: true,
    template: template(),
    transclude: true
  };

  function controller(scope) {
    scope.submissions = 0;
    scope.points = {};
    scope.solutionView = false;
    scope.trueValue = true;

    scope.interactionCallback = interactionCallback;
    scope.lockGraph = lockGraph;
    scope.pointsToCoordinateString = pointsToCoordinateString;
    scope.renewResponse = renewResponse;

    scope.undoModel = new CsUndoModel();
    scope.undoModel.setGetState(getUndoState);
    scope.undoModel.setRevertState(revertToUndoState);
    scope.undoModel.init();

    scope.unlockGraph = unlockGraph;

    this.getInitialParams = getInitialParams;
    this.setInitialParams = setInitialParams;

    scope.$watch('graphCallback', watchGraphCallback);

    //-----------------------------------------------

    function setInitialParams(initialParams) {
      scope.initialParams = initialParams;
    }

    function getInitialParams() {
      return scope.initialParams;
    }

    function watchGraphCallback(n) {
      if (scope.graphCallback) {
        if (scope.initialParams) {
          scope.graphCallback(scope.initialParams);
        }
        if (scope.locked) {
          scope.graphCallback({
            lockGraph: true
          });
        }
        if (scope.answers) {
          scope.renewResponse(scope.answers);
        }
      }
    }

    function round(coord) {
      var px = coord.x;
      var py = coord.y;
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
      return {
        x: px,
        y: py
      };
    }

    function pointsToCoordinateString(points) {

      function mkCoordinateString(p) {
        var rounded = round(p);
        return rounded.x + ',' + rounded.y;
      }

      return _.map(points, mkCoordinateString);
    }

    function interactionCallback(params) {
      if (params.points) {
        scope.points = params.points;
        scope.undoModel.remember();
        scope.pointResponse = scope.pointsToCoordinateString(params.points);
        scope.graphCallback({
          graphStyle: {}
        });
        var phase = scope.$root.$$phase;
        if (phase !== '$apply' && phase !== '$digest') {
          scope.$apply();
        }
      } else {
        scope.pointResponse = null;
      }
    }

    function lockGraph() {
      scope.locked = true;
      scope.graphCallback({
        lockGraph: true
      });
    }

    function unlockGraph() {
      scope.locked = false;
      scope.graphCallback({
        unlockGraph: true
      });
      scope.graphCallback({
        graphStyle: {},
        pointsStyle: 'blue'
      });
    }

    function renewResponse(response) {
      if (response) {
        var points = [];
        for (var i = 0; i < response.length; i++) {
          var point = response[i].split(',');
          points.push({
            x: point[0],
            y: point[1]
          });
        }
        if (scope.graphCallback) {
          scope.graphCallback({
            points: points
          });
        }
      }
      return response;
    }

    function getUndoState(){
      return scope.points;
    }

    function revertToUndoState(state){
      scope.points = state;
      scope.pointResponse = scope.pointsToCoordinateString(state);
      if (scope.graphCallback) {
        scope.graphCallback({
          points: scope.points
        });
      }
    }
  }

  function link(scope, element, attrs) {

    if (attrs.solutionView) {
      var containerWidth, containerHeight;
      var graphContainer = element.find('.graph-container');
      containerHeight = containerWidth = 500;

      var graphAttrs = scope.createGraphAttributes(scope.config, scope.config.maxPoints);
      graphContainer.attr(graphAttrs);
      graphContainer.css({
        width: containerWidth,
        height: containerHeight
      });

      $compile(graphContainer)(scope);
    }

    scope.containerBridge = {
      answerChangedHandler: answerChangedHandler,
      editable: setEditable,
      getSession: getSession,
      isAnswerEmpty: isAnswerEmpty,
      reset: reset,
      setDataAndSession: setDataAndSession,
      setInstructorData: setInstructorData,
      setMode: setMode,
      setPlayerSkin: setPlayerSkin,
      setResponse: setResponse
    };

    scope.$watch('editable', watchEditable);
    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

    //------------------------------------------
    // only functions below
    //------------------------------------------


    function renderSolution() {
      var solutionScope = scope.$new();
      var solutionContainer = element.find('.solution-container');
      var solutionGraphAttrs = scope.createGraphAttributes(scope.config, scope.config.maxPoints, 'graphCallbackSolution');
      solutionContainer.attr(solutionGraphAttrs);
      solutionContainer.css({
        width: scope.containerWidth,
        height: scope.containerHeight
      });
      solutionScope.interactionCallback = function() {};
      solutionScope.$watch('graphCallbackSolution', function(solutionGraphCallback) {
        if (solutionGraphCallback) {
          var response = scope.correctResponse;
          var points = [];
          for (var i = 0; i < response.length; i++) {
            var point = response[i].split(',');
            points.push({
              x: point[0],
              y: point[1]
            });
          }
          solutionGraphCallback({
            points: points,
            lockGraph: true,
            pointsStyle: colors.correct
          });
        }
      });

      $compile(solutionContainer)(solutionScope);
    }

    function pointsColors(response) {
      if (response.correctness === 'correct') {
        return colors.correct;
      } else {
        return _(response.studentResponse)
          .map(function(point, index) {
            if (scope.config.orderMatters === true) {
              return response.correctResponse[index] === point ? 'correct' : 'incorrect';
            } else {
              return _.include(response.correctResponse, point) ? 'correct' : 'incorrect';
            }
          })
          .map(function(correctness) {
            return colors[correctness];
          }).value();
      }
    }

    function setPlayerSkin(skin) {
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
    }

    function setDataAndSession(dataAndSession) {

      CanvasTemplates.extendScope(scope, 'corespring-point-intercept');

      var config = dataAndSession.data.model.config || {};
      scope.config = _.defaults(config, {
        showFeedback: true
      });
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
      scope.pointLabels = config.labelsType === 'present' ? config.pointLabels : '';
      scope.maxPoints = config.maxPoints;
      scope.showInputs = true;

      var containerWidth, containerHeight;
      var graphContainer = element.find('.graph-container');

      containerWidth = parseInt(config.graphWidth, 10) || 500;
      containerHeight = parseInt(config.graphHeight, 10) || 500;

      scope.containerWidth = containerWidth;
      scope.containerHeight = containerHeight;

      var graphAttrs = scope.createGraphAttributes(config, config.maxPoints);
      graphContainer.attr(graphAttrs);
      graphContainer.css({
        width: containerWidth,
        height: containerHeight
      });
      graphContainer.parents('.graph-group').css({
        width: containerWidth,
        height: containerHeight
      });

      $compile(graphContainer)(scope);

      if (dataAndSession.session) {
        scope.answers = dataAndSession.session.answers;
        scope.pointResponse = dataAndSession.session.answers;
      }
    }


    /**
     * Returns an array of points
     * Each point is a comma separated string
     * of x and y, eg. for x=12 and y=45 the point is "12,45"
     */
    function getSession() {
      return {
        answers: scope.pointResponse
      };
    }

    function setInstructorData(data) {
      scope.renewResponse(data.correctResponse);
      this.setResponse({
        correctness: 'correct'
      });
      scope.lockGraph();
    }

    function setResponse(response) {
      console.log("setResponse", response);
      scope.correctClass = response.correctness;
      scope.feedback = response && response.feedback;
      scope.response = response;

      var borderColor = colors[(response && response.correctness) || 'none'];

      scope.graphCallback({
        graphStyle: {
          borderColor: borderColor,
          borderWidth: '2px'
        },
        pointsStyle: pointsColors(response)
      });
      if (response && response.correctness !== 'correct') {
        scope.correctResponse = response.correctResponse;
        if (response.correctResponse) {
          renderSolution();
        }
      }
    }

    function setMode(newMode) {
      scope.playerMode = newMode;
    }

    function reset() {
      scope.unlockGraph();

      var solutionContainer = element.find('.solution-container');
      solutionContainer.empty();

      scope.response = undefined;
      scope.feedback = undefined;
      scope.correctResponse = undefined;
      scope.isFeedbackVisible = false;
      scope.isSeeAnswerPanelExpanded = false;

      scope.undoModel.startOver();
    }

    function isAnswerEmpty() {
      return _.isEmpty(scope.pointResponse);
    }

    function answerChangedHandler(callback) {
      scope.$watch('pointResponse', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          callback();
        }
      }, true);
    }

    function setEditable(e) {
      scope.editable = e;
    }

    function watchEditable(e) {
      if (!_.isUndefined(e) && e === false && scope.graphCallback) {
        scope.graphCallback({
          lockGraph: true
        });
      }
    }

  }

  function template() {
    return [
        '<div class="point-interaction-view">',
        '  <div class="graph-interaction">',
        '    <div class="additional-text"',
        '        ng-show="additionalText">',
        '      <p ng-bind-html-unsafe="additionalText"></p>',
        '    </div>',
        '    <correct-answer-toggle visible="correctResponse"',
        '        toggle="isSeeAnswerPanelExpanded"></correct-answer-toggle>',
        '    <div class="graph-controls"',
        '        ng-show="showInputs"',
        '        ng-hide="response">',
        '      <div class="scale-display text-center">',
        '        <span cs-undo-button-with-model></span>',
        '        <span cs-start-over-button-with-model></span>',
        '      </div>',
        '    </div>',
        '    <div class="graph-group">',
        '      <div class="graph-group-element"',
        '          ng-class="{graphShown: !isSeeAnswerPanelExpanded}">',
        '        <div class="graph-container"></div>',
        '      </div>',
        '      <div class="graph-group-element"',
        '          ng-class="{graphShown: isSeeAnswerPanelExpanded}">',
        '        <div class="solution-container"></div>',
        '      </div>',
        '    </div>',
        '    <div class="correct-legend"',
        '        ng-if="isSeeAnswerPanelExpanded">{{correctResponse.equation}}',
        '    </div>',
        '  </div>',
        '  <div id="initialParams"',
        '      ng-transclude></div>',
        '  <div class="feedback-holder"',
        '      ng-show="model.config.showFeedback && !isSeeAnswerPanelExpanded">',
        '    <div ng-show="feedback"',
        '        feedback="feedback"',
        '        icon-set="{{iconset}}"',
        '        correct-class="{{correctClass}}"></div>',
        '  </div>',
        '  <div ng-show="response.comments"',
        '      class="well"',
        '      ng-bind-html-unsafe="response.comments"></div>',
        '</div>'
      ].join('\n');
  }
}