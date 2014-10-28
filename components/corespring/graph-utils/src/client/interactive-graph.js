var def = [
  '$log', 'ScaleUtils', 'GraphHelper',
  function($log, ScaleUtils, GraphHelper) {
    return {
      template: "<div><a ng-click='boo()'>TestResize</a> <a ng-click='removeSelected()' ng-show='selected.length > 0'>Delete</a><div class='paper'></div></div>",
      scope: {
        ngmodel: "=",
        responsemodel: "="
      },
      link: function(scope, elm, attr, ngModel) {
        var paperElement = $(elm).find('.paper');
        scope.graph = new GraphHelper(paperElement[0], {
          horizontalAxisLength: 500,
          verticalAxisLength: 200,
          domain: [0, 10],
          range: [0, 3],
          applyCallback: function() {
            scope.$apply();
          },
          selectionChanged: function() {
            scope.selected = scope.graph.getSelectedElements();
            scope.$apply();
          }
        });
        scope.graph.addHorizontalAxis("bottom", {tickFrequency: 10});
        scope.graph.addVerticalAxis("left", {tickFrequency: 3, visible: false});

        scope.boo = function() {
          scope.q = !scope.q;
          scope.graph.updateOptions({domain: [0, scope.q ? 20 : 10]});
        };

        function rebuildGraph() {
          _.each(scope['responsemodel'], function(o, level) {
            switch (o.type) {
              case "point":
                scope.graph.addMovablePoint(o, o);
                break;
              case "line":
                scope.graph.addMovableLineSegment(o, o);
                break;
              case "ray":
                scope.graph.addMovableRay(o, o);
                break;
            }
          });
          scope.graph.redraw();
        }

        scope.removeSelected = function() {
          var selectedPositions = scope.graph.getSelectedElements();
          scope['responsemodel'] = _.filter(scope['responsemodel'], function(e) {
             return !_.contains(selectedPositions, e.rangePosition);
          });
          _.each(scope['responsemodel'], function(e, idx) {
            e.rangePosition = idx + 1;
          });
          scope.graph.clear();
          rebuildGraph();
        };

        scope.$watch('ngmodel', function(n) {
          console.log('model changed', n);
          scope['responsemodel'] = _.cloneDeep(n.objects);
          if (!n) return;
          rebuildGraph();
        });
      }
    };
  }
];


exports.framework = "angular";
exports.directive = {
  name: "interactiveGraph",
  directive: def
};
