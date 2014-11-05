var NUMBER_OF_PLANES = 3;
var HORIZONTAL_AXIS_WIDTH = 500;
var VERTICAL_AXIS_HEIGHT = 300;

var main = [
  '$sce', '$log',

  function($sce, $log) {

    var def;

    var link = function(scope, element, attrs) {

      scope.editable = true;
      scope.response = {};

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          console.log("number line", dataAndSession);

          scope.model = dataAndSession.data.model;

          if (dataAndSession.session && dataAndSession.session.answers) {
            scope.response = dataAndSession.session.answers;
          }

        },

        getSession: function() {
          return {
            answers: scope.response
          };
        },

        setResponse: function(response) {
        },

        setMode: function(newMode) {
        },

        reset: function() {
        },

        isAnswerEmpty: function() {
          return _.isEmpty(this.getSession().answers);
        },

        answerChangedHandler: function(callback) {
          scope.$watch("answer", function(newValue, oldValue) {
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
    };


    def = {
      scope: {},
      replace: true,
      restrict: 'EA',
      link: link,
      template: [
        '<div>',
        ' <div interactive-graph ngModel="model" responseModel="response">{{$index}}</div>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

var interactiveGraph = [
  '$log', 'ScaleUtils', 'GraphHelper',
  function($log, ScaleUtils, GraphHelper) {
    return {
      template: [
        "<div>",
        '  <ul ng-show="model.config.groupingEnabled" class="nav nav-pills" >',
        '    <li role="presentation"  ng-show="model.config.allEnabled || model.config.pointEnabled" ng-class="{active: isGroupActive(\'Point\')}"  ng-mousedown="selectGroup(\'Point\')"><a>Point</a></li>',
        '    <li role="presentation" ng-show="model.config.allEnabled || model.config.lineEnabled" ng-class="{active: isGroupActive(\'Line\')}" ng-mousedown="selectGroup(\'Line\')"><a>Line</a></li>',
        '    <li role="presentation" ng-show="model.config.allEnabled || model.config.rayEnabled" ng-class="{active: isGroupActive(\'Ray\')}" ng-mousedown="selectGroup(\'Ray\')"><a>Ray</a></li>',
        '  </ul>',
        '  <ul class="nav nav-pills" >',
        '    <li role="presentation" ng-hide="!isGroupActive(\'Point\')" ng-show="model.config.allEnabled || model.config.pointEnabled" ng-class="{active: isActive(\'PF\')}"  ng-mousedown="select(\'PF\')"><a>PF</a></li>',
        '    <li role="presentation" ng-hide="!isGroupActive(\'Line\')" ng-show="model.config.allEnabled || model.config.lineEnabled" ng-class="{active: isActive(\'LEE\')}" ng-mousedown="select(\'LEE\')"><a>LEE</a></li>',
        '    <li role="presentation" ng-hide="!isGroupActive(\'Line\')" ng-show="model.config.allEnabled || model.config.lineEnabled" ng-class="{active: isActive(\'LEF\')}" ng-mousedown="select(\'LEF\')"><a>LEF</a></li>',
        '    <li role="presentation" ng-hide="!isGroupActive(\'Line\')" ng-show="model.config.allEnabled || model.config.lineEnabled" ng-class="{active: isActive(\'LFE\')}" ng-mousedown="select(\'LFE\')"><a>LFE</a></li>',
        '    <li role="presentation" ng-hide="!isGroupActive(\'Line\')" ng-show="model.config.allEnabled || model.config.lineEnabled" ng-class="{active: isActive(\'LFF\')}" ng-mousedown="select(\'LFF\')"><a>LFF</a></li>',
        '    <li role="presentation" ng-hide="!isGroupActive(\'Ray\')" ng-show="model.config.allEnabled || model.config.rayEnabled" ng-class="{active: isActive(\'REP\')}" ng-mousedown="select(\'REP\')"><a>REP</a></li>',
        '    <li role="presentation" ng-hide="!isGroupActive(\'Ray\')" ng-show="model.config.allEnabled || model.config.rayEnabled" ng-class="{active: isActive(\'RFP\')}" ng-mousedown="select(\'RFP\')"><a>RFP</a></li>',
        '    <li role="presentation" ng-hide="!isGroupActive(\'Ray\')" ng-show="model.config.allEnabled || model.config.rayEnabled" ng-class="{active: isActive(\'REN\')}" ng-mousedown="select(\'REN\')"><a>REN</a></li>',
        '    <li role="presentation" ng-hide="!isGroupActive(\'Ray\')" ng-show="model.config.allEnabled || model.config.rayEnabled" ng-class="{active: isActive(\'RFN\')}" ng-mousedown="select(\'RFN\')"><a>RFN</a></li>',
        '    <li role="presentation"><a ng-click="removeSelected()" ng-show="selected.length > 0"><i class="fa fa-trash-o"></i></a></li>',
        '  </ul>',
        "  <div class='paper'></div>",
        "</div>"
      ].join(''),
      scope: {
        model: "=ngmodel",
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
              scope.responsemodel.push(_.extend(defaultLineModel, {"leftPoint": "full", "rightPoint": "full"}));
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
          horizontalAxisLength: HORIZONTAL_AXIS_WIDTH,
          verticalAxisLength: VERTICAL_AXIS_HEIGHT,
          domain: [0, 10],
          range: [0, NUMBER_OF_PLANES],
          applyCallback: function() {
            scope.$apply();
          },
          selectionChanged: function() {
            scope.selected = scope.graph.getSelectedElements();
            scope.$apply();
          }
        });

        scope.graph.addHorizontalAxis("bottom", {tickFrequency: 20});
        scope.graph.addVerticalAxis("left", {tickFrequency: 5, visible: true});

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
          scope.selected = [];
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

        scope.isGroupActive = function(group) {
          if (!scope.model.config.groupingEnabled) {
            return true;
          }
          return group === scope.selectedGroup;
        };

        scope.selectGroup = function(group) {
          scope.selectedGroup = group;
        };

        scope.$watch('model', function(n) {
          console.log('model changed', n);
          if (n) {
            scope.graph.updateOptions(n.config);
            scope.responsemodel = _.cloneDeep(n.objects) || [];
            rebuildGraph();
          }
        }, true);
      }
    };

  }
];


exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  },
  {
    name: 'interactiveGraph',
    directive: interactiveGraph
  }
];