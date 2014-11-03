var def = [
  '$log', 'ScaleUtils', 'GraphHelper',
  function($log, ScaleUtils, GraphHelper) {
    return {
      template: [
        "<div>",
        "  <div><a ng-click='boo()'>TestResize</a> </div>",
        '  <ul class="nav nav-pills" role="tablist">',
        '    <li role="presentation" ng-class="{active: isActive(\'PF\')}" ng-click="select(\'PF\')"><a>PF</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'LEE\')}" ng-click="select(\'LEE\')"><a>LEE</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'LEF\')}" ng-click="select(\'LEF\')"><a>LEF</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'LFE\')}" ng-click="select(\'LFE\')"><a>LFE</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'LFF\')}" ng-click="select(\'LFF\')"><a>LFF</a></li>',

        '    <li role="presentation" ng-class="{active: isActive(\'REP\')}" ng-click="select(\'REP\')"><a>REP</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'RFP\')}" ng-click="select(\'RFP\')"><a>RFP</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'REN\')}" ng-click="select(\'REN\')"><a>REN</a></li>',
        '    <li role="presentation" ng-class="{active: isActive(\'RFN\')}" ng-click="select(\'RFN\')"><a>RFN</a></li>',
        '    <li role="presentation"><a ng-click="removeSelected()" ng-show="selected.length > 0"><i class="fa fa-trash-o"></i></a></li>',
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

        $(document).keydown(function(e) {
          var selectedCount = scope.graph.getSelectedElements().length;
          if (selectedCount > 0 && (e.keyCode === 8 || e.keyCode === 46)) {
            e.stopPropagation();
            e.preventDefault();
            scope.removeSelected();
            scope.$apply();
          }

        });

        paperElement.mousedown(function(event) {
          console.log('click', event);
          if (scope.responsemodel.length > 2) {
            return;
          }
          var lastRange = scope.responsemodel.length + 1;
          var dr = scope.graph.coordsToDomainRange(event.offsetX, event.offsetY);
          var defaultLineModel = {
            "type": "line",
            "domainPosition": dr[0],
            "rangePosition": lastRange,
            "size": 1,
            "leftPoint": "empty",
            "rightPoint": "empty"
          };
          var defaultRayModel = {
            "type": "ray",
            "domainPosition": dr[0],
            "rangePosition": lastRange,
            "pointType": "empty"
          };
          switch (scope.selectedTab) {
            case "PF":
              scope.responsemodel.push({
                "type": "point",
                "pointType": "full",
                "domainPosition": dr[0],
                "rangePosition": lastRange
              });
              break;
            case "LEE":
              scope.responsemodel.push(defaultLineModel);
              break;
            case "LEF":
              scope.responsemodel.push(_.extend(defaultLineModel, {"rightPoint": "full"}));
              break;
            case "LFE":
              scope.responsemodel.push(_.extend(defaultLineModel, {"leftPoint": "full"}));
              break;
            case "LFF":
              scope.responsemodel.push(_.extend(defaultLineModel, {"leftPoint": "full"}));
              break;
            case "REN":
              scope.responsemodel.push(_.extend(defaultRayModel, {pointType: "empty", direction: "negative"}));
              break;
            case "REP":
              scope.responsemodel.push(_.extend(defaultRayModel, {pointType: "empty", direction: "positive"}));
              break;
            case "RFN":
              scope.responsemodel.push(_.extend(defaultRayModel, {pointType: "full", direction: "negative"}));
              break;
            case "RFP":
              scope.responsemodel.push(_.extend(defaultRayModel, {pointType: "full", direction: "positive"}));
              break;
          }
          rebuildGraph();
          scope.$apply();
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
          _.each(scope.responsemodel, function(o, level) {
            var options = _.cloneDeep(o);
            switch (o.type) {
              case "point":
                scope.graph.addMovablePoint(o, options);
                break;
              case "line":
                scope.graph.addMovableLineSegment(o, options);
                break;
              case "ray":
                scope.graph.addMovableRay(o, options);
                break;
            }
          });
          scope.graph.redraw();
        }

        scope.removeSelected = function() {
          var selectedPositions = scope.graph.getSelectedElements();
          scope.responsemodel = _.filter(scope.responsemodel, function(e) {
            return !_.contains(selectedPositions, e.rangePosition);
          }) || [];
          _.each(scope.responsemodel, function(e, idx) {
            e.rangePosition = idx + 1;
          });
          scope.graph.clear();
          rebuildGraph();
          scope.selected = scope.graph.getSelectedElements();
        };

        scope.isActive = function(tab) {
          return tab === scope.selectedTab;
        };

        scope.select = function(tab) {
          scope.selectedTab = tab;
        };

        scope.$watch('ngmodel', function(n) {
          console.log('model changed', n);
          if (n) {
            scope.responsemodel = _.cloneDeep(n.objects) || [];
            rebuildGraph();
          }
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
