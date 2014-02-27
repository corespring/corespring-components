var def = [
  '$log', 'KhanUtil','BoxAndWhiskersPlot',
  function ($log, KhanUtilService, BoxAndWhiskersPlot) {

    return {
      scope: {
        model: "=ngmodel"
      },
      template: "<div><div class='box-and-whiskers-graph'></div></div>",
      link: function (scope, elm, attr, ngModel) {

        var dataSet = _.sortBy([14, 6, 3, 2, 4, 15, 11, 8, 1, 7, 2, 1, 3, 4, 10, 22, 20], _.identity);

        var domainMin = _.first(dataSet) - 1;
        var domainMax = _.last(dataSet) + 1;
        var domainLength = domainMax - domainMin;
        var tickLength = Math.ceil(domainLength / 15);

        BoxAndWhiskersPlot.configure(dataSet);

        scope.isVertical = function() {
          return scope.model && scope.model.orientation == 'vertical';
        };

        var translateGraphCoordToDomain = function (val) {
          return Math.floor(val * tickLength + domainMin);
        };

        scope.$watch(function () {
          return _.reduce(scope.plots, function (memo, plot) {
            return memo + plot.q0.coord + plot.q1Line.coordA + plot.medianLine.coordA + plot.q3Line.coordA + plot.q4.coord;
          }, "");
        }, function () {
          if (!scope.plots) return;
          var coords =[];
          var idx = scope.isVertical() ? 1 : 0;
          for (var i = 0; i < scope.plots.length; i++) {
            coords.push({
              q0: translateGraphCoordToDomain(scope.plots[i].q0.coord[idx]),
              q1Line: translateGraphCoordToDomain(scope.plots[i].q1Line.coordA[idx]),
              medianLine: translateGraphCoordToDomain(scope.plots[i].medianLine.coordA[idx]),
              q3Line: translateGraphCoordToDomain(scope.plots[i].q3Line.coordA[idx]),
              q4: translateGraphCoordToDomain(scope.plots[i].q4.coord[idx])
            });
          }
          scope.model.coords = coords;
        });

        var drawGraph = function (element) {
          var isVertical = scope.model.orientation === 'vertical';

          element.empty();

          var graphie = KhanUtilService.KhanUtil.createGraphie(element[0]);

          var numPlots = scope.model.plots || 1;
          var range = isVertical ? [
            [ -3.5, 15.5 + 4 * numPlots ],
            [ -0.5, 15 ]
          ] : [
            [ -0.5, 15.5 ],
            [ -3.5, 4 * numPlots ]
          ];

          graphie.init(
            {
              range: range,
              scale: [ 30, 30 ]
            }
          );

          if (isVertical) {
            graphie.line([ -2, 0 ], [ -2, 15 ]);
            for (var tick = 0; tick <= 15; tick += 1) {
              graphie.line([ -2.25, tick], [ -1.75, tick ]);
              $('#container').append(graphie.label([ -2.2, tick ], Math.floor(tick * tickLength + domainMin), "left", false));
            }
          }
          else {
            graphie.line([ 0, -2 ], [ 15, -2 ]);
            for (var tick = 0; tick <= 15; tick += 1) {
              graphie.line([ tick, -1.75 ], [ tick, -2.25 ]);
              $('#container').append(graphie.label([ tick, -2.25 ], Math.floor(tick * tickLength + domainMin), "below", false));
            }

          }

          graphie.addMouseLayer();

          scope.plots = [];
          for (var i = 0; i < scope.model.plots; i++) {
            scope.plots.push(isVertical ? BoxAndWhiskersPlot.addVerticalPlot(graphie, i*4) : BoxAndWhiskersPlot.addHorizontalPlot(graphie, i*4));
          }

          $(graphie.mouselayer.canvas).css('position', 'absolute');

        };

        scope.$watch(_.pick(scope.model, 'orientation', 'plots'), function () {
          drawGraph($(elm).find('.box-and-whiskers-graph'));
        }, true);


      }
    };
  }
];


exports.framework = "angular";
exports.directive = {
  name: "boxAndWhiskersGraph",
  directive: def
};
