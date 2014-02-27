/* global KhanUtil */

var def = [
  '$log',
  function ($log) {

    return {
      scope: {
        model: "=ngmodel"
      },
      template: "<div>{{coords}}<div id='graph'></div></div>",
      link: function (scope, elm, attr, ngModel) {

        var dataSet = _.sortBy([14, 6, 3, 2, 4, 15, 11, 8, 1, 7, 2, 1, 3, 4, 10, 22, 20], _.identity);

        var domainMin = _.first(dataSet) - 1;
        var domainMax = _.last(dataSet) + 1;
        var domainLength = domainMax - domainMin;
        var tickLength = Math.ceil(domainLength / 15);

        var translateGraphCoordToDomain = function (val) {
          return Math.floor(val * tickLength + domainMin);
        };

        var translateDomainToGraphCoord = function (val) {
          return (val - domainMin) / tickLength;
        };

        scope.$watch(function () {
          return _.reduce(scope.plots, function (memo, plot) {
            return memo + plot.q0.coord + plot.q1Line.coordA + plot.medianLine.coordA + plot.q3Line.coordA + plot.q4.coord;
          }, "");
        }, function () {
          scope.coords = [];
          for (var i = 0; i < scope.plots.length; i++) {
            scope.coords.push({
              q0: translateGraphCoordToDomain(scope.plots[i].q0.coord[0]),
              q1Line: translateGraphCoordToDomain(scope.plots[i].q1Line.coordA[0]),
              medianLine: translateGraphCoordToDomain(scope.plots[i].medianLine.coordA[0]),
              q3Line: translateGraphCoordToDomain(scope.plots[i].q3Line.coordA[0]),
              q4: translateGraphCoordToDomain(scope.plots[i].q4.coord[0])
            });
          }
        });

        scope.$watch('model.plots', function () {

          $(elm).find('#graph').empty();

          var graphie = KhanUtil.createGraphie($(elm).find('#graph')[0]);

          var addPlot = function (y, q0, q1, q2, q3, q4) {

            q0 = q0 || Math.floor(domainLength / 8);
            q1 = q1 || Math.floor(domainLength / 4);
            q2 = q2 || Math.floor(domainLength / 2);
            q3 = q3 || Math.floor((3 * domainLength) / 4);
            q4 = q4 || domainLength;

            var graph = {};
            graph.q0 = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q0), y ], snapX: 0.5, constraints: { constrainY: true }, normalStyle: { fill: KhanUtil.BLUE, stroke: KhanUtil.BLUE } });
            graph.moveQ0 = function (x) {
              graph.q0.setCoord([x, graph.q0.coord[1]]);
              graph.q0.updateLineEnds();
              if (x >= graph.q1Line.coordA[0]) {
                graph.moveQ1(x + 0.5);
              }
              scope.$apply();
            };

            graph.q1top = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q1), y + 1 ], visible: false });
            graph.q1mid = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q1), y ], visible: false });
            graph.q1bot = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q1), y - 1 ], visible: false });
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

            graph.mtop = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q2), y + 1 ], visible: false });
            graph.mbot = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q2), y - 1 ], visible: false });
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

            graph.q3top = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q3), y + 1 ], visible: false });
            graph.q3mid = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q3), y ], visible: false });
            graph.q3bot = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q3), y - 1 ], visible: false });
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

            graph.q4 = graphie.addMovablePoint({ coord: [ translateDomainToGraphCoord(q4), y ], snapX: 0.5, constraints: { constrainY: true }, normalStyle: { fill: KhanUtil.BLUE, stroke: KhanUtil.BLUE } });
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

            graph.q1Line = graphie.addMovableLineSegment({ pointA: graph.q1bot, pointZ: graph.q1top, snapX: 0.5, constraints: { constrainY: true } });
            graph.medianLine = graphie.addMovableLineSegment({ pointA: graph.mbot, pointZ: graph.mtop, snapX: 0.5, constraints: { constrainY: true } });
            graph.q3Line = graphie.addMovableLineSegment({ pointA: graph.q3bot, pointZ: graph.q3top, snapX: 0.5, constraints: { constrainY: true } });


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

          };

          graphie.init(
            {
              range: [
                [ -0.5, 15.5 ],
                [ -3.5, 4 * scope.model.plots ]
              ],
              scale: [ 30, 30 ]
            }
          );

          graphie.line([ 0, -2 ], [ 15, -2 ]);

          for (var tick = 0; tick <= 15; tick += 1) {
            graphie.line([ tick, -1.75 ], [ tick, -2.25 ]);
            $('#container').append(graphie.label([ tick, -2.25 ], Math.floor(tick * tickLength + domainMin), "below", false));
          }

          graphie.addMouseLayer();

          scope.plots = [];
          for (var i = 0; i < scope.model.plots; i++) {
            scope.plots.push(addPlot(i * 4));
          }


          $(graphie.mouselayer.canvas).css('position', 'absolute');

        });
      }
    };
  }
];


exports.framework = "angular";
exports.directive = {
  name: "khanBoxAndWhiskers",
  directive: def
};
