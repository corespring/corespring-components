/* global KhanUtil */

exports.framework = "angular";
exports.service = [ '$log', '$rootScope', function($log, $rootScope){
  var getOrElse = function(val, elseVal) {
    return _.isUndefined(val) ? elseVal : val;
  };

  var service = {
    configure: function(dataSet) {

      service.domainMin = _.first(dataSet) - 1;
      service.domainMax = _.last(dataSet) + 1;
      service.domainLength = service.domainMax - service.domainMin;
      service.tickLength = Math.ceil(service.domainLength / 15);

      service.translateGraphCoordToDomain = function (val) {
        return Math.floor(val * service.tickLength + service.domainMin);
      };

      service.translateDomainToGraphCoord = function (val) {
        return (val - service.domainMin) / service.tickLength;
      };
    },

    calculateQuarterPoints: function(dataSet) {

      var calculateMedianAndSplit = function(array) {
        var median, midIdx;
        var dsLeft, dsRight;

        if (array.length % 2 === 0) {
          // 1 2 3 4
          midIdx = array.length / 2 - 1;
          median = (array[midIdx] + array[midIdx+1]) / 2;
        } else {
          // 1 2 3 4 5
          midIdx = Math.floor(array.length / 2);
          median = array[midIdx];
        }
        dsLeft = _.first(array, midIdx);
        dsRight = _.last(array, midIdx);

        return {left: dsLeft, right: dsRight, median: median};
      };

      var ds = _.sortBy(_.clone(dataSet), _.identity);

      var main = calculateMedianAndSplit(ds);
      var left = calculateMedianAndSplit(main.left);
      var right = calculateMedianAndSplit(main.right);

      return {
        q0: _.first(ds),
        q1Line: left.median,
        medianLine: main.median,
        q3Line: right.median,
        q4: _.last(ds)
      };
    },

    addVerticalPlot: function (graphie, x, plotData) {

      var scope = $rootScope;

      var q0 = getOrElse(plotData.q0, Math.floor(service.domainLength / 8));
      var q1 = getOrElse(plotData.q1Line, Math.floor(service.domainLength / 4));
      var q2 = getOrElse(plotData.medianLine, Math.floor(service.domainLength / 2));
      var q3 = getOrElse(plotData.q3Line, Math.floor((3 * service.domainLength) / 4));
      var q4 = getOrElse(plotData.q4, service.domainLength);

      graphie.label([ x, 0 ], plotData.label, "below", false);

      var graph = {};
      graph.q0 = graphie.addMovablePoint({ coord: [ x, service.translateDomainToGraphCoord(q0) ], snapY: 0.5, constraints: { constrainX: true, fixed: plotData.fixed }, normalStyle: { fill: KhanUtil.BLUE, stroke: KhanUtil.BLUE } });

      graph.moveQ0 = function (y) {
        graph.q0.setCoord([graph.q0.coord[0], y]);
        graph.q0.updateLineEnds();
        if (y >= graph.q1Line.coordA[1]) {
          graph.moveQ1(y + 0.5);
        }
        scope.$apply();
      };

      graph.q1right = graphie.addMovablePoint({ coord: [ x + 1, service.translateDomainToGraphCoord(q1) ], visible: false });
      graph.q1mid = graphie.addMovablePoint({ coord: [ x, service.translateDomainToGraphCoord(q1) ], visible: false });
      graph.q1left = graphie.addMovablePoint({ coord: [ x - 1, service.translateDomainToGraphCoord(q1) ], visible: false });
      graph.moveQ1 = function (y) {
        graph.q1left.setCoord([graph.q1left.coord[0], y]);
        graph.q1mid.setCoord([graph.q1mid.coord[0], y]);
        graph.q1right.setCoord([graph.q1right.coord[0], y]);
        graph.q1left.updateLineEnds();
        graph.q1mid.updateLineEnds();
        graph.q1right.updateLineEnds();
        if (y <= graph.q0.coord[1]) {
          graph.moveQ0(y - 0.5);
        } else if (y >= graph.medianLine.coordA[1]) {
          graph.moveM(y + 0.5);
        }
        scope.$apply();
      };

      graph.mleft = graphie.addMovablePoint({ coord: [ x + 1, service.translateDomainToGraphCoord(q2) ], visible: false });
      graph.mright = graphie.addMovablePoint({ coord: [ x - 1, service.translateDomainToGraphCoord(q2) ], visible: false });
      graph.moveM = function (y) {
        graph.mleft.setCoord([graph.mleft.coord[0], y]);
        graph.mright.setCoord([graph.mright.coord[0], y]);
        graph.mleft.updateLineEnds();
        graph.mright.updateLineEnds();
        if (y <= graph.q1Line.coordA[1]) {
          graph.moveQ1(y - 0.5);
        } else if (y >= graph.q3Line.coordA[1]) {
          graph.moveQ3(y + 0.5);
        }
        scope.$apply();
      };

      graph.q3right = graphie.addMovablePoint({ coord: [ x + 1, service.translateDomainToGraphCoord(q3)], visible: false });
      graph.q3mid = graphie.addMovablePoint({ coord: [ x, service.translateDomainToGraphCoord(q3) ], visible: false });
      graph.q3left = graphie.addMovablePoint({ coord: [ x - 1, service.translateDomainToGraphCoord(q3) ], visible: false });
      graph.moveQ3 = function (y) {
        graph.q3left.setCoord([graph.q3left.coord[0], y]);
        graph.q3mid.setCoord([graph.q3mid.coord[0], y]);
        graph.q3right.setCoord([graph.q3right.coord[0], y]);
        graph.q3left.updateLineEnds();
        graph.q3mid.updateLineEnds();
        graph.q3right.updateLineEnds();
        if (y <= graph.medianLine.coordA[1]) {
          graph.moveM(y - 0.5);
        } else if (y >= graph.q4.coord[1]) {
          graph.moveQ4(y + 0.5);
        }
        scope.$apply();
      };

      graph.q4 = graphie.addMovablePoint({ coord: [ x, service.translateDomainToGraphCoord(q4) ], snapY: 0.5, constraints: { constrainX: true, fixed: plotData.fixed }, normalStyle: { fill: KhanUtil.BLUE, stroke: KhanUtil.BLUE } });
      graph.moveQ4 = function (y) {
        graph.q4.setCoord([graph.q4.coord[0], y]);
        graph.q4.updateLineEnds();
        if (y <= graph.q3Line.coordA[1]) {
          graph.moveQ3(y - 0.5);
        }
        scope.$apply();
      };

      graph.botLine = graphie.addMovableLineSegment({ pointA: graph.q0, pointZ: graph.q1mid, fixed: true });
      graph.leftLine = graphie.addMovableLineSegment({ pointA: graph.q1left, pointZ: graph.q3left, fixed: true });
      graph.rightLine = graphie.addMovableLineSegment({ pointA: graph.q1right, pointZ: graph.q3right, fixed: true });
      graph.topLine = graphie.addMovableLineSegment({ pointA: graph.q3mid, pointZ: graph.q4, fixed: true });


      graph.q1Line = graphie.addMovableLineSegment({ pointA: graph.q1right, pointZ: graph.q1left, snapY: 0.5, constraints: { constrainX: true, fixed: plotData.fixed } });
      graph.medianLine = graphie.addMovableLineSegment({ pointA: graph.mleft, pointZ: graph.mright, snapY: 0.5, constraints: { constrainX: true, fixed: plotData.fixed } });
      graph.q3Line = graphie.addMovableLineSegment({ pointA: graph.q3right, pointZ: graph.q3left, snapY: 0.5, constraints: { constrainX: true, fixed: plotData.fixed } });

      graph.q0.onMove = function (x, y) {
        if (y < 0 || y > 13) {
          return false;
        }
        graph.moveQ0(y);
      };

      graph.q4.onMove = function (x, y) {
        if (y < 2 || y > 15) {
          return false;
        }
        graph.moveQ4(y);
      };

      graph.q1Line.onMove = function (dX, dY) {
        var newY = this.coordA[1];
        var oldY = newY - dY;
        if (newY < 0.5 || newY > 13.5) {
          graph.moveQ1(oldY);
          return;
        }
        graph.moveQ1(newY);
      };

      graph.medianLine.onMove = function (dX, dY) {
        var newY = this.coordA[1];
        var oldY = newY - dY;
        if (newY < 1 || newY > 14) {
          graph.moveM(oldY);
          return;
        }
        graph.moveM(newY);
      };

      graph.q3Line.onMove = function (dX, dY) {
        var newY = this.coordA[1];
        var oldY = newY - dY;
        if (newY < 1.5 || newY > 14.5) {
          graph.moveQ3(oldY);
          return;
        }
        graph.moveQ3(newY);
      };

      return graph;
    },

    addHorizontalPlot: function (graphie, y, plotData) {
      var scope = $rootScope;
      var q0 = getOrElse(plotData.q0, Math.floor(service.domainLength / 8));
      var q1 = getOrElse(plotData.q1Line, Math.floor(service.domainLength / 4));
      var q2 = getOrElse(plotData.medianLine, Math.floor(service.domainLength / 2));
      var q3 = getOrElse(plotData.q3Line, Math.floor((3 * service.domainLength) / 4));
      var q4 = getOrElse(plotData.q4, service.domainLength);


      graphie.label([ 0, y ], plotData.label, "left", false);

      var graph = {};
      graph.q0 = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q0), y ], snapX: 0.5, constraints: { constrainY: true, fixed: plotData.fixed }, normalStyle: { fill: KhanUtil.BLUE, stroke: KhanUtil.BLUE } });
      $(graph.q0).unbind();
      graph.moveQ0 = function (x) {
        graph.q0.setCoord([x, graph.q0.coord[1]]);
        graph.q0.updateLineEnds();
        if (x >= graph.q1Line.coordA[0]) {
          graph.moveQ1(x + 0.5);
        }
        scope.$apply();
      };

      graph.q1top = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q1), y + 1 ], visible: false });
      graph.q1mid = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q1), y ], visible: false });
      graph.q1bot = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q1), y - 1 ], visible: false });
      graph.moveQ1 = function (x) {
        graph.q1top.setCoord([x, graph.q1top.coord[1]]);
        graph.q1mid.setCoord([x, graph.q1mid.coord[1]]);
        graph.q1bot.setCoord([x, graph.q1bot.coord[1]]);
        graph.q1top.updateLineEnds();
        graph.q1mid.updateLineEnds();
        graph.q1bot.updateLineEnds();
        if (x <= graph.q0.coord[0]) {
          graph.moveQ0(x - 0.5);
        } else if (x >= graph.medianLine.coordA[0]) {
          graph.moveM(x + 0.5);
        }
        scope.$apply();
      };

      graph.mtop = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q2), y + 1 ], visible: false });
      graph.mbot = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q2), y - 1 ], visible: false });
      graph.moveM = function (x) {
        graph.mtop.setCoord([x, graph.mtop.coord[1]]);
        graph.mbot.setCoord([x, graph.mbot.coord[1]]);
        graph.mtop.updateLineEnds();
        graph.mbot.updateLineEnds();
        if (x <= graph.q1Line.coordA[0]) {
          graph.moveQ1(x - 0.5);
        } else if (x >= graph.q3Line.coordA[0]) {
          graph.moveQ3(x + 0.5);
        }
        scope.$apply();
      };

      graph.q3top = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q3), y + 1 ], visible: false });
      graph.q3mid = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q3), y ], visible: false });
      graph.q3bot = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q3), y - 1 ], visible: false });
      graph.moveQ3 = function (x) {
        graph.q3top.setCoord([x, graph.q3top.coord[1]]);
        graph.q3mid.setCoord([x, graph.q3mid.coord[1]]);
        graph.q3bot.setCoord([x, graph.q3bot.coord[1]]);
        graph.q3top.updateLineEnds();
        graph.q3mid.updateLineEnds();
        graph.q3bot.updateLineEnds();
        if (x <= graph.medianLine.coordA[0]) {
          graph.moveM(x - 0.5);
        } else if (x >= graph.q4.coord[0]) {
          graph.moveQ4(x + 0.5);
        }
        scope.$apply();
      };

      graph.q4 = graphie.addMovablePoint({ coord: [ service.translateDomainToGraphCoord(q4), y ], snapX: 0.5, constraints: { constrainY: true, fixed: plotData.fixed}, normalStyle: { fill: KhanUtil.BLUE, stroke: KhanUtil.BLUE } });
      graph.moveQ4 = function (x) {
        graph.q4.setCoord([x, graph.q4.coord[1]]);
        graph.q4.updateLineEnds();
        if (x <= graph.q3Line.coordA[0]) {
          graph.moveQ3(x - 0.5);
        }
        scope.$apply();
      };

      graph.leftLine = graphie.addMovableLineSegment({ pointA: graph.q0, pointZ: graph.q1mid, fixed: true });
      graph.topLine = graphie.addMovableLineSegment({ pointA: graph.q1top, pointZ: graph.q3top, fixed: true });
      graph.botLine = graphie.addMovableLineSegment({ pointA: graph.q1bot, pointZ: graph.q3bot, fixed: true });
      graph.rightLine = graphie.addMovableLineSegment({ pointA: graph.q3mid, pointZ: graph.q4, fixed: true });

      graph.q1Line = graphie.addMovableLineSegment({ pointA: graph.q1bot, pointZ: graph.q1top, snapX: 0.5, constraints: { constrainY: true, fixed: plotData.fixed } });
      graph.medianLine = graphie.addMovableLineSegment({ pointA: graph.mbot, pointZ: graph.mtop, snapX: 0.5, constraints: { constrainY: true, fixed: plotData.fixed } });
      graph.q3Line = graphie.addMovableLineSegment({ pointA: graph.q3bot, pointZ: graph.q3top, snapX: 0.5, constraints: { constrainY: true, fixed: plotData.fixed } });


      graph.q0.onMove = function (x, y) {
        if (x < 0 || x > 13) {
          return false;
        }
        graph.moveQ0(x);
      };

      graph.q4.onMove = function (x, y) {
        if (x < 2 || x > 15) {
          return false;
        }
        graph.moveQ4(x);
      };

      graph.q1Line.onMove = function (dX, dY) {
        var newX = this.coordA[0];
        var oldX = newX - dX;
        if (newX < 0.5 || newX > 13.5) {
          graph.moveQ1(oldX);
          return;
        }
        graph.moveQ1(newX);
      };

      graph.medianLine.onMove = function (dX, dY) {
        var newX = this.coordA[0];
        var oldX = newX - dX;
        if (newX < 1 || newX > 14) {
          graph.moveM(oldX);
          return;
        }
        graph.moveM(newX);
      };

      graph.q3Line.onMove = function (dX, dY) {
        var newX = this.coordA[0];
        var oldX = newX - dX;
        if (newX < 1.5 || newX > 14.5) {
          graph.moveQ3(oldX);
          return;
        }
        graph.moveQ3(newX);
      };

      return graph;
    }


  };
  return service;
}];