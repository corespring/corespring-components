var def = [
  '$log', 'ScaleUtils', 'GraphHelper',
  function($log, ScaleUtils, GraphHelper) {
    return {
      template: [
        "<div>",
        "  <div><a ng-click='boo()'>TestResize</a> <a ng-click='removeSelected()' ng-show='selected.length > 0'>Delete</a></div>",
        '  <ul class="nav nav-pills" role="tablist">',
        '    <li role="presentation" ng-class="{active: isActive(\'PE\')}" ng-click="select(\'PE\')"><a>PE</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'PF\')}" ng-click="select(\'PF\')"><a>PF</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'LEE\')}" ng-click="select(\'LEE\')"><a>LEE</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'LEF\')}" ng-click="select(\'LEF\')"><a>LEF</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'LFE\')}" ng-click="select(\'LFE\')"><a>LFE</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'LFF\')}" ng-click="select(\'LFF\')"><a>LFF</a></li>',
        '  </ul>',
        "  <div class='paper'></div>",
        "</div>"
      ].join(''),
      scope: {
        ngmodel: "=",
        responsemodel: "="
      },
      link: function(scope, elm, attr, ngModel) {
        var paperElement = $(elm).find('.paper');
        paperElement.mousedown(function(event) {
          console.log('click', event);
          if (scope['responsemodel'].length > 2) {
            return;
          }
          var lastRange = scope['responsemodel'].length + 1;
          if (event.target.nodeName === "svg") {
            var dr = scope.graph.coordsToDomainRange(event.offsetX, event.offsetY);
            switch (scope.selectedTab) {
              case "PE":
                scope.responsemodel.push({
                  "type": "point",
                  "pointType": "empty",
                  "domainPosition": dr[0],
                  "rangePosition": lastRange
                });
                break;
              case "PF":
                scope.responsemodel.push({
                  "type": "point",
                  "pointType": "full",
                  "domainPosition": dr[0],
                  "rangePosition": lastRange
                });
                break;
//              case "PE": scope.graph.addMovablePoint({domainPosition: dr[0], rangePosition: 3},{pointType: 'empty'}); break;
//              case "PF": scope.graph.addMovablePoint({domainPosition: dr[0], rangePosition: 3},{pointType: 'full'}); break;
            }
            rebuildGraph();
//            scope.graph.redraw();
            console.log(dr);
          }
        });
        scope.graph = new GraphHelper(paperElement[0], {
          horizontalAxisLength: 500,
          verticalAxisLength: 120,
          domain: [0, 10],
          range: [0, 3],
          applyCallback: function() {
            scope.$apply();
          },
          selectionChanged: function() {
            scope.selected = scope.graph.getSelectedElements();
            scope.$apply();
          },
          elementAdded: function() {
          }
        });

        scope.graph.addHorizontalAxis("bottom", {tickFrequency: 10});
        scope.graph.addVerticalAxis("left", {tickFrequency: 5, visible: false});

        scope.boo = function() {
          scope.q = !scope.q;
          scope.graph.updateOptions({domain: [0, scope.q ? 20 : 10]});
        };

        function rebuildGraph() {
          scope.graph.clear();
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
          }) || [];
          _.each(scope['responsemodel'], function(e, idx) {
            e.rangePosition = idx + 1;
          });
          scope.graph.clear();
          rebuildGraph();
        };

        scope.isActive = function(tab) {
          return tab === scope.selectedTab;
        };

        scope.select = function(tab) {
          scope.selectedTab = tab;
        };

        scope.$watch('ngmodel', function(n) {
          console.log('model changed', n);
          scope['responsemodel'] = _.cloneDeep(n.objects) || [];
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
