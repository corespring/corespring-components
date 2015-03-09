/* global console, exports */

var main = [
  '$sce', '$log',
  function($sce, $log) {

    "use strict";

    var def;

    var link = function(scope, element, attrs) {

      scope.editable = true;
      scope.response = {};

      scope.changeHandler = function() {
        if (_.isFunction(scope.answerChangeCallback)) {
          scope.answerChangeCallback();
        }
      };

      scope.colors = {
        correct: $(element).find('.correct-element').css('color'),
        incorrect: $(element).find('.incorrect-element').css('color')
      };

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          console.log("number line", dataAndSession);

          scope.correctModel = scope.model = dataAndSession.data.model;

          if (dataAndSession.session && dataAndSession.session.answers) {
            scope.response = dataAndSession.session.answers;
            scope.model.config.initialElements = _.cloneDeep(dataAndSession.session.answers);
          }

        },

        getSession: function() {
          return {
            answers: scope.response
          };
        },

        setResponse: function(response) {
          console.log('number line response ', response);
          scope.serverResponse = response;

          scope.correctModel = _.cloneDeep(scope.model);
          scope.correctModel.config.exhibitOnly = true;
          scope.correctModel.config.margin = {top: 30, right: 10, bottom: 30, left: 20};
          var i = 0;
          scope.correctModel.config.initialElements = _.map(response.correctResponse, function(cr) {
            i++;
            return _.extend(cr, {rangePosition: i});
          });
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
          scope.answerChangeCallback = callback;
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
        '       changeHandler="changeHandler()"',
        '       editable="editable"',
        '       colors="colors"></div>',
        '  <div ng-show="serverResponse.feedback.message" class="panel panel-default feedback-panel {{serverResponse.correctness}}">',
        '    <div class="panel-heading">&nbsp;</div>',
        '    <div class="panel-body">',
        '      <span type="success" ng-bind-html-unsafe="serverResponse.feedback.message"></span>',
        '    </div>',
        '  </div>',
        '  <div see-answer-panel ng-if="serverResponse && serverResponse.correctness !== \'correct\'">',
        '    <div interactive-graph',
        '         ngModel="correctModel"',
        '         responseModel="dummyResponse"',
        '         colors="colors"></div>',
        '  </div>',
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

    "use strict";

    var groups = {
      "Point": ["PF"],
      "Line": ["LEE", "LEF", "LFE", "LFF"],
      "Ray": ["REP", "REN", "RFP", "RFN"]
    };

    var NUMBER_OF_PLANES = 3;
    var HORIZONTAL_AXIS_WIDTH = 480;

    return {
      template:[
        '<div>',
        '  <ul ng-show="editable && config.groupingEnabled" class="nav nav-pills" >',
        '    <li role="presentation" ng-show="isGroupEnabled(\'Point\')" ng-class="{active: isGroupActive(\'Point\')}"  ng-mousedown="selectGroup(\'Point\')"><a>Point</a></li>',
        '    <li role="presentation" ng-show="isGroupEnabled(\'Line\')" ng-class="{active: isGroupActive(\'Line\')}" ng-mousedown="selectGroup(\'Line\')"><a>Line</a></li>',
        '    <li role="presentation"  ng-show="isGroupEnabled(\'Ray\')" ng-class="{active: isGroupActive(\'Ray\')}" ng-mousedown="selectGroup(\'Ray\')"><a>Ray</a></li>',
        '  </ul>',
        '  <div ng-show="editable" class="element-selector" >',
        '    <span role="presentation" class="element-pf" ng-show="isGroupActive(\'Point\') && isTypeEnabled(\'PF\')"   ng-mousedown="select(\'PF\')"><a ng-class="{active: isActive(\'PF\')}">&nbsp;</a></span>',
        '    <span role="presentation" class="element-lff" ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LFF\')"  ng-mousedown="select(\'LFF\')"><a ng-class="{active: isActive(\'LFF\')}">&nbsp;</a></span>',
        '    <span role="presentation" class="element-lef" ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LEF\')"  ng-mousedown="select(\'LEF\')"><a ng-class="{active: isActive(\'LEF\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-lfe" ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LFE\')"  ng-mousedown="select(\'LFE\')"><a ng-class="{active: isActive(\'LFE\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-lee" ng-show="isGroupActive(\'Line\') && isTypeEnabled(\'LEE\')"  ng-mousedown="select(\'LEE\')"><a ng-class="{active: isActive(\'LEE\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-rfn" ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'RFN\')"  ng-mousedown="select(\'RFN\')"><a ng-class="{active: isActive(\'RFN\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-rfp" ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'RFP\')" ng-mousedown="select(\'RFP\')"><a ng-class="{active: isActive(\'RFP\')}" >&nbsp;</a></span>',
        '    <span role="presentation"  class="element-ren" ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'REN\')"  ng-mousedown="select(\'REN\')"><a ng-class="{active: isActive(\'REN\')}">&nbsp;</a></span>',
        '    <span role="presentation"  class="element-rep" ng-show="isGroupActive(\'Ray\') && isTypeEnabled(\'REP\')"  ng-mousedown="select(\'REP\')"><a ng-class="{active: isActive(\'REP\')}">&nbsp;</a></span>',
        '    <span role="presentation"><a ng-click="removeSelectedElement()" ng-show="selected.length > 0"><i class="bin-icon fa fa-trash-o fa-lg"></i></a></span>',
        '  </div>',
        "  <div class='paper'></div>",
        "</div>"
      ].join(''),
      replace: true,
      scope: {
        colors: "=",
        model: "=ngmodel",
        responsemodel: "=",
        serverresponse: "=",
        editable: "=",
        changehandler: "&changehandler"
      },
      controller: function($scope){
        //set default config to avoid npe
        $scope.config = {availableTypes:{}};
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

        function getLastRange() {
          var lastRange = 0;
          _.each(scope.responsemodel, function(e) {
            if (e.rangePosition > lastRange) {
              lastRange = e.rangePosition;
            }
          });
          return lastRange;
        }

        paperElement.mousedown(function(event) {
          if (!scope.editable) {
            return;
          }
          if (scope.responsemodel.length >= (scope.config.maxNumberOfPoints || 3)) {
            return;
          }
          var newRangePosition = getLastRange() + 1;
          var offX  = (event.offsetX || event.pageX - $(event.target).offset().left);
          var offY  = (event.offsetY || event.pageY - $(event.target).offset().top);
          var dr = scope.graph.coordsToDomainRange(offX, offY);
          var defaultLineModel = {
            "type": "line",
            "domainPosition": dr[0],
            "rangePosition": newRangePosition,
            "size": 1,
            "leftPoint": "empty",
            "rightPoint": "empty"
          };
          var defaultRayModel = {
            "type": "ray",
            "domainPosition": dr[0],
            "rangePosition": newRangePosition,
            "pointType": "empty"
          };
          switch (scope.selectedType) {
            case "PF":
              scope.responsemodel.push({
                "type": "point",
                "pointType": "full",
                "domainPosition": dr[0],
                "rangePosition": 0
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
          repositionElements();
          rebuildGraph();
          scope.$apply();
        });

        scope.graph = new GraphHelper(paperElement[0], {
          horizontalAxisLength: HORIZONTAL_AXIS_WIDTH,
          domain: [0, 10],
          range: [0, NUMBER_OF_PLANES],
          applyCallback: function() {
            console.log('apply');
            scope.$apply();
          },
          selectionChanged: function() {
            scope.selected = scope.graph.getSelectedElements();
            scope.$apply();
          }
        });

        function repositionElements() {
          var planeIndex = {};
          var lastRange = 0;
          _.each(scope.responsemodel, function (e, idx) {
            if (e.type == 'point') {
              planeIndex[e.domainPosition] = !_.isUndefined(planeIndex[e.domainPosition]) ? (planeIndex[e.domainPosition] + 1) : 0;
              e.rangePosition = planeIndex[e.domainPosition];
              lastRange = e.rangePosition;
            }
          });
          _.each(scope.responsemodel, function (e, idx) {
            if (e.type !== 'point') {
              e.rangePosition = ++lastRange;
            }
          });
        }

        // Clear out graph and rebuild it from the model
        function rebuildGraph() {
          console.log('rebuild');
          scope.graph.clear();

          _.each(scope.responsemodel, function(o, level) {
            var options = _.cloneDeep(o);
            if (!_.isUndefined(o.isCorrect)) {
              options.fillColor = options.strokeColor = o.isCorrect ? scope.colors.correct : scope.colors.incorrect;
            }
            switch (o.type) {
              case "point":
                options.onMoveFinished = function() {
                  repositionElements();
                  scope.graph.clear();
                  rebuildGraph();

                };
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
          var selectedElements = scope.graph.getSelectedElements();
          console.log("Removing: ", selectedElements);
          scope.responsemodel = _.filter(scope.responsemodel, function(e) {
            return _.isUndefined(_.find(selectedElements, function(element) {
              return e.rangePosition === element.rangePosition && e.domainPosition === element.domainPosition;
            }));
          }) || [];
          scope.graph.clear();
          repositionElements();
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
            return scope.config.availableTypes[type] === true;
          });
        };

        scope.isGroupActive = function(group) {
          if (!scope.config.groupingEnabled) {
            return true;
          }
          return group === scope.selectedGroup;
        };

        scope.selectGroup = function(group) {
          scope.selectedGroup = group;
        };

        scope.isTypeEnabled = function(type) {
          return scope.config.availableTypes[type] === true;
        };

        var resetGraph = function(model) {
          scope.graph.updateOptions(model.config);

          scope.graph.addHorizontalAxis("bottom", {
            ticks: model.config.ticks,
            tickFrequency: model.config.tickFrequency || 10,
            snapPerTick: model.config.snapPerTick,
            showMinorTicks: model.config.showMinorTicks
          });
          scope.graph.addVerticalAxis("left", {visible: false});

          scope.responsemodel = _.cloneDeep(model.config.initialElements) || [];
          rebuildGraph();
          scope.selectedType = model.config.initialType;
          scope.selectedGroup = _.find(_.keys(groups), function(g) {
            return _.contains(groups[g], scope.selectedType);
          });
        };

        scope.$watch('model', function(n) {
          if (n) {
            //overwrite default config with real config
            if(n.config) {
              scope.config = n.config;
            }
            resetGraph(n);
          }
        }, true);

        scope.$watch('editable', function(n) {
          if (!_.isUndefined(n) && !n) {
            scope.graph.updateOptions({exhibitOnly: true});
          }
        }, true);

        scope.$watch('responsemodel', function(n, prev) {
          if (!_.isEqual(n, prev)) {
            scope.changehandler();
          }
        }, true);

        scope.$watch('serverresponse', function(n, prev) {
          if (!_.isEmpty(n)) {
            scope.responsemodel = _.cloneDeep(n.feedback.elements) || [];
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