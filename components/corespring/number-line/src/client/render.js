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
        '  <div feedback="serverResponse.feedback.message" correct-class="{{serverResponse.correctClass}}"></div>',
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
      "Point": ["PF","PE"],
      "Line": ["LEE", "LEF", "LFE", "LFF"],
      "Ray": ["REP", "REN", "RFP", "RFN"]
    };

    var NUMBER_OF_PLANES = 3;
    var HORIZONTAL_AXIS_WIDTH = 480;

    return {
      template: [
        '<div>',
        '  <ul ng-show="editable && config.groupingEnabled" class="nav nav-pills" >',
        '    <li role="presentation" ng-show="isGroupEnabled(\'Point\')" ng-class="{active: isGroupActive(\'Point\')}"  ng-mousedown="selectGroup(\'Point\')"><a>Point</a></li>',
        '    <li role="presentation" ng-show="isGroupEnabled(\'Line\')" ng-class="{active: isGroupActive(\'Line\')}" ng-mousedown="selectGroup(\'Line\')"><a>Line</a></li>',
        '    <li role="presentation"  ng-show="isGroupEnabled(\'Ray\')" ng-class="{active: isGroupActive(\'Ray\')}" ng-mousedown="selectGroup(\'Ray\')"><a>Ray</a></li>',
        '  </ul>',
        '  <div ng-show="editable" class="element-selector" >',
        '    <span role="presentation" class="element-pf" ng-show="isGroupActive(\'Point\') && isTypeEnabled(\'PF\')"   ng-mousedown="select(\'PF\')"><a ng-class="{active: isActive(\'PF\')}">&nbsp;</a></span>',
        '    <span role="presentation" class="element-pe" ng-show="isGroupActive(\'Point\') && isTypeEnabled(\'PE\')"   ng-mousedown="select(\'PE\')"><a ng-class="{active: isActive(\'PE\')}">&nbsp;</a></span>',
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
      controller: function($scope) {
        //set default config to avoid npe
        $scope.config = {availableTypes: {}};
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

        scope.addElement = function(domainPosition, elementType) {
          if (!scope.editable) {
            return;
          }
          if (scope.responsemodel.length >= (scope.config.maxNumberOfPoints || 3)) {
            return;
          }
          var newRangePosition = 0;
          var defaultPointModel = {
            "type": "point",
            "pointType": "full",
            "domainPosition": domainPosition,
            "rangePosition": 0
          };

          var defaultLineModel = {
            "type": "line",
            "domainPosition": domainPosition,
            "rangePosition": newRangePosition,
            "size": 1,
            "leftPoint": "empty",
            "rightPoint": "empty"
          };
          var defaultRayModel = {
            "type": "ray",
            "domainPosition": domainPosition,
            "rangePosition": newRangePosition,
            "pointType": "empty"
          };
          switch (elementType) {
            case "PF":
              scope.responsemodel.push(defaultPointModel);
              break;
            case "PE":
              scope.responsemodel.push(_.extend(defaultPointModel, {pointType: 'empty'}));
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
          rebuildGraph(_.last(scope.responsemodel));
          scope.$apply();

        };

        paperElement.mousedown(function(event) {
          var offX = (event.offsetX || event.pageX - $(event.target).offset().left);
          var offY = (event.offsetY || event.pageY - $(event.target).offset().top);
          var dr = scope.graph.coordsToDomainRange(offX, offY);
          scope.addElement(dr[0], scope.selectedType);
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

        function isIntersecting(element, withElement) {
          if (element.rangePosition !== withElement.rangePosition) {
            return false;
          }
          if (element.type === 'point') {
            switch (withElement.type) {
              case 'point':
                return element.domainPosition === withElement.domainPosition;
              case 'line':
                return (element.domainPosition >= withElement.domainPosition && element.domainPosition <= withElement.domainPosition + withElement.size);
              case 'ray':
                if (withElement.direction === 'positive') {
                  return element.domainPosition >= withElement.domainPosition;
                } else {
                  return element.domainPosition <= withElement.domainPosition;
                }
            }
          } else if (element.type === 'line') {
            switch (withElement.type) {
              case 'point':
                return isIntersecting(withElement, element);
              case 'line':
                return (element.domainPosition >= withElement.domainPosition && element.domainPosition <= withElement.domainPosition + withElement.size) || (withElement.domainPosition >= element.domainPosition && withElement.domainPosition <= element.domainPosition + element.size);
              case 'ray':
                if (withElement.direction === 'positive') {
                  return element.domainPosition + element.size >= withElement.domainPosition;
                } else {
                  return element.domainPosition <= withElement.domainPosition;
                }
            }
          } else if (element.type === 'ray') {
            switch (withElement.type) {
              case 'point':
                return isIntersecting(withElement, element);
              case 'line':
                return isIntersecting(withElement, element);
              case 'ray':
                if (element.direction === withElement.direction) {
                  return true;
                }
                if (element.direction === 'positive') {
                  return withElement.domainPosition >= element.domainPosition;
                } else {
                  return withElement.domainPosition <= element.domainPosition;
                }

            }
          }
        }

        function repositionElements(lastMovedElement) {
          console.log("Repositioning", lastMovedElement);
          var intersectsWithAny = function(e) {
            return _.any(scope.responsemodel, function(r) {
              return e !== r && isIntersecting(e, r);
            });
          };
          if (lastMovedElement) {
            while (intersectsWithAny(lastMovedElement)) {
              lastMovedElement.rangePosition++;
            }
          }
          var elementsSortedByRangePosition = _.sortBy(scope.responsemodel, function(e) {
            return e.rangePosition;
          });
          _.each(elementsSortedByRangePosition, function(e) {
            e.rangePosition = 0;
            while (intersectsWithAny(e)) {
              e.rangePosition++;
            }
          });

        }

        // Clear out graph and rebuild it from the model
        function rebuildGraph(lastMovedElement) {
          console.log('rebuild');
          scope.graph.clear();
          repositionElements(lastMovedElement);
          _.each(scope.responsemodel, function(o, level) {
            var options = _.cloneDeep(o);
            if (!_.isUndefined(o.isCorrect)) {
              options.fillColor = options.strokeColor = o.isCorrect ? scope.colors.correct : scope.colors.incorrect;
            }
            options.onMoveFinished = function(type, domainPosition) {
              var lastMovedElement = _.find(scope.responsemodel, function(e) {
                return e.domainPosition === domainPosition && e.type === type;
              });
              console.log("Move Finished", type, domainPosition, lastMovedElement);
              rebuildGraph(lastMovedElement);
            };
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
          var selectedElements = scope.graph.getSelectedElements();
          console.log("Removing: ", selectedElements);
          scope.responsemodel = _.filter(scope.responsemodel, function(e) {
            return _.isUndefined(_.find(selectedElements, function(element) {
              return e.rangePosition === element.rangePosition && e.domainPosition === element.domainPosition;
            }));
          }) || [];
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

        scope.resetGraph = function(model) {
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
            if (n.config) {
              scope.config = n.config;
            }
            scope.resetGraph(n);
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
            scope.resetGraph(scope.model);
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