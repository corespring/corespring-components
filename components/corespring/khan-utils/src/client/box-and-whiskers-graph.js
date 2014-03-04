var def = [
  '$log', 'KhanUtil', 'BoxAndWhiskersPlot',
  function ($log, KhanUtilService, BoxAndWhiskersPlot) {

    return {
      scope: {
        model: "=ngmodel"
      },
      template: "<div><div class='box-and-whiskers-graph'></div></div>",
      link: function (scope, elm, attr, ngModel) {

        scope.isVertical = function () {
          return scope.model && scope.model.orientation === 'vertical';
        };

        var translateGraphCoordToDomain = function (val) {
          return Number((val * scope.tickLength + scope.domainMin).toFixed(2));
        };

        scope.$watch(function () {
          return _.reduce(scope.plots, function (memo, plot) {
            return memo + plot.q0.coord + plot.q1Line.coordA + plot.medianLine.coordA + plot.q3Line.coordA + plot.q4.coord;
          }, "");
        }, function () {
          if (!scope.plots) return;
          var coords = [];
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
          var isVertical = scope.isVertical();

          element.empty();

          var graphie = KhanUtilService.KhanUtil.createGraphie(element[0]);

          var numPlots = scope.model.plots.length || 1;
          var range = isVertical ? [
            [ -4.5,  4 * numPlots ],
            [ -1, 15.5 ]
          ] : [
            [ -3.5, 15.5 ],
            [ -3.5, 4 * numPlots ]
          ];

          graphie.init({
              range: range,
              scale: [ 30, 30 ]
            }
          );

          if (isVertical) {
            graphie.line([ -2, 0 ], [ -2, 15 ]);
            graphie.label([ -4.5, 8 ], scope.model.domain.label, "below", false).addClass('vertical');
            for (var tick = 0; tick <= 15; tick += 1) {
              graphie.line([ -2.25, tick], [ -1.75, tick ]);
              graphie.label([ -2.2, tick ], Math.floor(tick * scope.tickLength + scope.domainMin), "left", false);
            }
          }
          else {
            graphie.line([ 0, -2 ], [ 15, -2 ]);
            graphie.label([ 7.5, -3.25 ], scope.model.domain.label, "below", false);
            for (var tick = 0; tick <= 15; tick += 1) {
              graphie.line([ tick, -1.75 ], [ tick, -2.25 ]);
              graphie.label([ tick, -2.25 ], Math.floor(tick * scope.tickLength + scope.domainMin), "below", false);
            }

          }

          graphie.addMouseLayer();

          scope.plots = [];
          _.each(scope.model.plots, function (plot, i) {
              var plotData = BoxAndWhiskersPlot.calculateQuarterPoints(plot.dataSet);
              plotData.label = plot.label;
              plotData.fixed = !plot.adjustable;

              if (isVertical) {
                scope.plots.push(BoxAndWhiskersPlot.addVerticalPlot(graphie, i * 4, plotData));
              } else {
                scope.plots.push(BoxAndWhiskersPlot.addHorizontalPlot(graphie, i * 4, plotData));
              }
            }
          );

          $(graphie.mouselayer.canvas).css('position', 'absolute');

        };

        scope.$watch(function() {
          return _.omit(scope.model, 'coords');
        }, function () {

          var dataSet = _.sortBy(_.flatten(_.union(_.pluck(scope.model.plots, 'dataSet'))), _.identity);

          console.log("Common dataset is: ");
          console.log(dataSet);

          scope.domainMin = _.first(dataSet) - 1;
          scope.domainMax = _.last(dataSet) + 1;
          scope.domainLength = scope.domainMax - scope.domainMin;
          scope.tickLength = Math.ceil(scope.domainLength / 15);

          BoxAndWhiskersPlot.configure(dataSet);

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
