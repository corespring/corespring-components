var main = [
  '$sce', '$log',

  function($sce, $log) {

    var def;

    var link = function(scope, element, attrs) {

      scope.editable = true;
      scope.response = {};

      scope.colors = {
        correct: $(element).find('.correct-element').css('color'),
        incorrect: $(element).find('.incorrect-element').css('color')
      };

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
          scope.serverResponse = response;
        },

        setMode: function(newMode) {
        },

        reset: function() {
          scope.serverResponse = undefined;
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
        '<div class="view-number-line">',
        '  <div interactive-graph',
        '       ngModel="model"',
        '       responseModel="response"',
        '       serverResponse="serverResponse"',
        '       editable="editable"',
        '       colors="colors"></div>',
        '  <div>{{serverResponse}}</div>',
        '  <div style="display: none">',
        '    <span class="correct-element"></span>',
        '    <span class="incorrect-element"></span>',
        '  </div>',
        '</div>'
      ].join("\n")
    };

    return def;
  }
];

var interactiveGraph = [
  '$log', 'ScaleUtils', 'GraphHelper',
  function($log, ScaleUtils, GraphHelper) {

    var groups = {
      "Point": ["PF"],
      "Line": ["LEE", "LEF", "LFE", "LFF"],
      "Ray": ["REP", "REN", "RFP", "RFN"]
    };

    var NUMBER_OF_PLANES = 3;
    var HORIZONTAL_AXIS_WIDTH = 500;

    return {
      template:[
        "<div>",
        '  <ul ng-show="editable && model.config.groupingEnabled" class="nav nav-pills" >',
        '    <li role="presentation"  ng-show="isGroupEnabled(\'Point\')" ng-class="{active: isGroupActive(\'Point\')}"  ng-mousedown="selectGroup(\'Point\')"><a>Point</a></li>',
        '    <li role="presentation"  ng-show="isGroupEnabled(\'Line\')" ng-class="{active: isGroupActive(\'Line\')}" ng-mousedown="selectGroup(\'Line\')"><a>Line</a></li>',
        '    <li role="presentation"  ng-show="isGroupEnabled(\'Ray\')" ng-class="{active: isGroupActive(\'Ray\')}" ng-mousedown="selectGroup(\'Ray\')"><a>Ray</a></li>',
        '  </ul>',
        '  <ul ng-show="editable" class="nav nav-pills" >',
        '    <li role="presentation"  ng-show="isGroupActive(\'Point\') && isTypeEnabled(\'PF\')" ng-class="{active: isActive(\'PF\')}"  ng-mousedown="select(\'PF\')"><a>PF</a></li>',
        '    <li role="presentation"  ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LEE\')" ng-class="{active: isActive(\'LEE\')}" ng-mousedown="select(\'LEE\')"><a>LEE</a></li>',
        '    <li role="presentation"  ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LEF\')" ng-class="{active: isActive(\'LEF\')}" ng-mousedown="select(\'LEF\')"><a>LEF</a></li>',
        '    <li role="presentation"  ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LFE\')" ng-class="{active: isActive(\'LFE\')}" ng-mousedown="select(\'LFE\')"><a>LFE</a></li>',
        '    <li role="presentation"  ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LFF\')" ng-class="{active: isActive(\'LFF\')}" ng-mousedown="select(\'LFF\')"><a>LFF</a></li>',
        '    <li role="presentation"  ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'REP\')" ng-class="{active: isActive(\'REP\')}" ng-mousedown="select(\'REP\')"><a>REP</a></li>',
        '    <li role="presentation"  ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'RFP\')" ng-class="{active: isActive(\'RFP\')}" ng-mousedown="select(\'RFP\')"><a>RFP</a></li>',
        '    <li role="presentation"  ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'REN\')" ng-class="{active: isActive(\'REN\')}" ng-mousedown="select(\'REN\')"><a>REN</a></li>',
        '    <li role="presentation"  ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'RFN\')" ng-class="{active: isActive(\'RFN\')}" ng-mousedown="select(\'RFN\')"><a>RFN</a></li>',
        '    <li role="presentation"><a ng-click="removeSelectedElement()" ng-show="selected.length > 0"><i class="fa fa-trash-o"></i></a></li>',
        '  </ul>',
        "  <div class='paper'></div>",
        "</div>"
      ].join(''),
      replace: true,
      scope: {
        colors: "=",
        model: "=ngmodel",
        responsemodel: "=",
        serverresponse: "=",
        editable: "="
      },
      link: function(scope, elm, attr, ngModel) {
        var paperElement = $(elm).find('.paper');

        $(document).keydown(function(e) {
          var selectedCount = scope.graph.getSelectedElements().length;
          if (selectedCount > 0 && (e.keyCode === 8 || e.keyCode === 46)) {
            e.stopPropagation();
            e.preventDefault();
            scope.removeSelectedElement();
            scope.$apply();
          }
        });

        paperElement.mousedown(function(event) {
          if (!scope.editable) {
            return;
          }
          console.log('click', event);
          if (scope.responsemodel.length >= (scope.model.config.maxNumberOfPoints || 3)) {
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
          switch (scope.selectedType) {
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

        // Clear out graph and rebuild it from the model
        function rebuildGraph() {
          scope.graph.clear();

          _.each(scope.responsemodel, function(o, level) {
            var options = _.cloneDeep(o);
            if (!_.isUndefined(o.isCorrect)) {
              options.fillColor = options.strokeColor = o.isCorrect ? scope.colors.correct : scope.colors.incorrect;
            }
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

        scope.removeSelectedElement = function() {
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

        scope.isActive = function(type) {
          return type === scope.selectedType;
        };

        scope.select = function(type) {
          scope.selectedType = type;
        };

        scope.isGroupEnabled = function(group) {
          return _.some(groups[group], function(type) {
            return scope.model.config.availableTypes[type] === true;
          });
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

        scope.isTypeEnabled = function(type) {
          return scope.model.config.availableTypes[type] === true;
        };

        var resetGraph = function(model) {
          scope.graph.updateOptions(model.config);

          scope.graph.addHorizontalAxis("bottom", {
            tickFrequency: model.config.tickFrequency || 10
          });
          scope.graph.addVerticalAxis("left", {visible: false});

          scope.responsemodel = _.cloneDeep(model.objects) || [];
          rebuildGraph();
          scope.selectedType = model.config.initialType;
          scope.selectedGroup = _.find(_.keys(groups), function(g) {
            return _.contains(groups[g], scope.selectedType);
          });
        };

        scope.$watch('model', function(n) {
          if (n) {
            resetGraph(n);
          }
        }, true);

        scope.$watch('editable', function(n) {
          console.log('editable changed to ',n);
          if (!_.isUndefined(n) && !n) {
            scope.graph.updateOptions({exhibitOnly: true});
          }
        }, true);

        scope.$watch('serverresponse', function(n, prev) {
          if (n) {
            console.log("Rebuilding Server Response");
            scope.responsemodel = _.cloneDeep(n.feedback) || [];
            rebuildGraph();
            scope.graph.updateOptions({exhibitOnly: true});
          } else if (prev) {
            resetGraph(scope.model);
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