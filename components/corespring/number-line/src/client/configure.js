var main = [
  '$log', 'ChoiceTemplates',
  function($log, ChoiceTemplates) {

    var attributes = [
      '<h3>Number Line Attributes</h3>',
      '<table class="attributes-table">',
      '  <tr>',
      '    <td>',
      '    <checkbox ng-model="fullModel.model.config.exhibitOnly">Make exhibit</checkbox>',
      '    <div>',
      '       Domain = <input type="number" class="form-control" ng-model="fullModel.model.config.domain[0]"/> to <input type="number" class="form-control" ng-model="fullModel.model.config.domain[1]"/>',
      '    </div>',
      '    <div>Number of Ticks: <input type="number" class="form-control" ng-model="fullModel.model.config.tickFrequency"/></div>',
      '    <checkbox ng-model="fullModel.model.config.showMinorTicks">Display minor tick marks</checkbox>',
      '    <div>Minor tick frequency: <input type="number" class="form-control" ng-model="fullModel.model.config.snapPerTick"/></div>',
      '    <div><a class="reset-defaults btn btn-default" ng-click="resetToDefaults()">Reset to default values</a></div>',
      '    </td>',
      '    <td>',
      '      <div interactive-graph',
      '           ngModel="sampleNumberLine.model"',
      '           responseModel="sampleNumberLine.responseModel"',
      '           options="sampleGraphOptions"',
      '           tickLabelClick="tickLabelClick"',
      '           editable="sampleNumberLine.editable"></div>',
      '      <div class="tick-label-override-input-holder" ng-show="isEditingTickLabel">',
      '        <input ng-model="tickBeingEdited.label" ng-click="$event.stopImmediatePropagation()" ng-keyup="tickEditKeyup($event)" type="text" class="tick-label-override-input" style="left: {{tickLabelEditingPosition}}px"/>',
      '      </div>',
      '      <div class="sample-description">Click on a label to edit or remove.</div>',
      '    </td>',
      '  </tr>',
      '</table>'
    ].join('');

    var initialView = [
      '<div collapsable-panel collapsable-panel-title="Initial view / Make Exhibit">',
      '  <p>Use this number line to set a starting point, line segment or ray. This is optional.</p>',
      '  <p>This number line may also be used to make an exhibit number line, which can not be manipulated by a student.',
      '  Be sure to check &ldquo;Make an Exhibit&rdquo; in the Number Line Attributes area above.</p>',
      '  <div interactive-graph',
      '       ngModel="initialView.model"',
      '       options="configGraphOptions"',
      '       responseModel="initialView.responseModel"',
      '       editable="initialView.editable"',
      '       colors="initialView.colors"></div>',
      '</div>'

    ].join('');

    var correctResponseView = [
      '<div ng-hide="fullModel.model.config.exhibitOnly" class="panel panel-default correct-response-panel">',
      '<div class="panel-heading"><h4>Correct Response</h4></div>',
      '  <div class="panel-body">',
      '    <p>Select answer type and place it on the number line. Intersecting points, line segments and/or rays will appear above the number line.</p>',
      '    <p><i>Note: A maximum of 20 points, line segments or rays may be plotted.</i></p>',
      '    <div interactive-graph',
      '         ngModel="correctResponseView.model"',
      '         responseModel="correctResponseView.responseModel"',
      '         options="configGraphOptions"',
      '         editable="correctResponseView.editable"></div>',
      '    </div>',
      '</div>'
    ].join('');

    var display = [
      '<div ng-hide="fullModel.model.config.exhibitOnly">',
      '<h3>Display</h3>',
      '<table class="allowed-elements">',
      '<tr><td>',
      '<div>Show student options for</div>',
      '<td>',
      '<div><checkbox id="points" ng-model="allow.points">Points</checkbox>',
      '<div><checkbox id="lines" ng-model="allow.lines">Line segments</checkbox>',
      '<div><checkbox id="rays" ng-model="allow.rays">Rays</checkbox>',
      '<div><checkbox id="all" ng-model="top.allowAll">All</checkbox>',
      '</table>',
      '</div>'
    ].join('');

    var feedback = [
      '<div ng-hide="fullModel.model.config.exhibitOnly">',
      '<div feedback-panel>',
      '  <div feedback-selector',
      '      fb-sel-label="If correct, show"',
      '      fb-sel-class="correct"',
      '      fb-sel-feedback-type="fullModel.feedback.correctFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.correctFeedback"',
      '      fb-sel-default-feedback="{{defaultCorrectFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If partially correct, show"',
      '      fb-sel-class="partial"',
      '      fb-sel-feedback-type="fullModel.feedback.partialFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.partialFeedback"',
      '      fb-sel-default-feedback="{{defaultPartialFeedback}}">',
      '  </div>',
      '  <div feedback-selector',
      '      fb-sel-label="If incorrect, show"',
      '      fb-sel-class="incorrect"',
      '      fb-sel-feedback-type="fullModel.feedback.incorrectFeedbackType"',
      '      fb-sel-custom-feedback="fullModel.feedback.incorrectFeedback"',
      '      fb-sel-default-feedback="{{defaultIncorrectFeedback}}">',
      '  </div>',
      '</div>',
      '</div>'

    ].join('');

    var points = ['PF','PE'];
    var lines = ['LEE','LEF','LFE','LFF'];
    var rays = ['REP','REN','RFP','RFN'];

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        scope.defaults = scope.data.defaultData.model.config;
        ChoiceTemplates.extendScope(scope, 'corespring-number-line');
        scope.allow = {};
        scope.top = {};
        scope.configGraphOptions = {
          startOverClearsGraph: true,
          undoDisabled: true
        };
        scope.sampleGraphOptions = {
          placeholderForEmptyTickLabel: "N/A",
          labelCursor: 'pointer'
        };
        scope.initialView = {
          editable: true,
          model: {
            "config": {
              "domain": [0, 20],
              "maxNumberOfPoints": 3,
              "tickFrequency": 20,
              "snapPerTick": 2,
              "showMinorTicks": true,
              "initialType": "PF",
              "exhibitOnly": false,
              "availableTypes": {
                "PF": true,
                "PE": true,
                "LEE": true,
                "LEF": true,
                "LFE": true,
                "LFF": true,
                "REP": true,
                "REN": true,
                "RFP": true,
                "RFN": true
              }
            }
          }
        };

        scope.tickLabelClick = function(tick, x) {
          scope.sampleNumberLine.model.config.tickLabelOverrides = scope.sampleNumberLine.model.config.tickLabelOverrides || [];

          var override = _.find(scope.sampleNumberLine.model.config.tickLabelOverrides, function(t) {
            return t.tick === tick;
          });
          if (_.isUndefined(override)) {
            scope.sampleNumberLine.model.config.tickLabelOverrides.push({tick: tick, label: tick.toFixed(2)});
            override = _.last(scope.sampleNumberLine.model.config.tickLabelOverrides);
          }
          override.label = override.label || tick.toFixed(2);
          scope.isEditingTickLabel = true;
          scope.tickLabelEditingPosition = x + 5;
          scope.tickBeingEdited = override;
          scope.$apply();
        };

        scope.correctResponseView = _.cloneDeep(scope.initialView);

        scope.sampleNumberLine = _.merge(_.cloneDeep(scope.initialView), {
          model: {
            config: {
              maxNumberOfPoints: 1
            }
          },
          editable: false
        });

        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            scope.initialView.model.config.initialElements = _.cloneDeep(model.model.config.initialElements);
            scope.correctResponseView.model.config.initialElements = _.cloneDeep(model.correctResponse) || [];
            scope.updatePartialScoringModel(model.correctResponse.length);
            scope.sampleNumberLine.model.config.tickLabelOverrides = _.cloneDeep(model.model.config.tickLabelOverrides);

            var hasAny = function(ofThese) {
              return _.any(ofThese, function(k) {
                 return scope.fullModel.model.config.availableTypes[k] === true;
              });
            };
            scope.allow = {
              points: hasAny(points),
              lines: hasAny(lines),
              rays: hasAny(rays)
            };
          },

          getModel: function() {
            return scope.fullModel;
          }
        };

        var updateInitialElements = function(n) {
          scope.$apply(function() {
            scope.fullModel.model.config.initialElements = _.cloneDeep(n);
            scope.initialView.model.config.initialElements = _.cloneDeep(n);
          });
        };

        var updateCorrectResponse = function(n) {
          scope.$apply(function() {
            scope.fullModel.correctResponse = _.cloneDeep(n);
            scope.correctResponseView.model.config.initialElements = _.cloneDeep(n);
            scope.updatePartialScoringModel(scope.correctResponseView.responseModel.length);
          });
        };

        var updateNumberLineOptions = function(n, onlyFor) {
          if (n) {
            scope.$apply(function() {
              _(n).omit('initialElements','tickLabelOverrides','exhibitOnly').each(function(e, k) {
                if (!_.isUndefined(n[k])) {
                  scope.initialView.model.config[k] = _.cloneDeep(n[k]);
                  scope.correctResponseView.model.config[k] = _.cloneDeep(n[k]);
                  scope.sampleNumberLine.model.config[k] = _.cloneDeep(n[k]);
                  scope.fullModel.model.config[k] = _.cloneDeep(n[k]);
                }
              });
            });
          }
        };

        var updateTickLabels = function(n) {
          if (n) {
            scope.$apply(function() {
              scope.initialView.model.config.tickLabelOverrides = _.cloneDeep(n.tickLabelOverrides);
              scope.correctResponseView.model.config.tickLabelOverrides = _.cloneDeep(n.tickLabelOverrides);
              scope.sampleNumberLine.model.tickLabelOverrides = _.cloneDeep(n.tickLabelOverrides);
              scope.fullModel.model.config.tickLabelOverrides = _.cloneDeep(n.tickLabelOverrides);
            });
          }
        };

        function debounce(fn) {
          return _.debounce(fn, 500, {
            trailing: true,
            leading: false
          });
        }

        scope.$watch('top.allowAll', function(n, o) {
          if (!_.isUndefined(n) && n !== o) {
            scope.allow.points = scope.allow.lines = scope.allow.rays = n;
          }
        });

        scope.$watch('allow', function(n) {
          if (n) {
            _.each(points, function(key) {
              scope.fullModel.model.config.availableTypes[key] = n.points;
            });
            _.each(lines, function(key) {
              scope.fullModel.model.config.availableTypes[key] = n.lines;
            });
            _.each(rays, function(key) {
              scope.fullModel.model.config.availableTypes[key] = n.rays;
            });
            if (n.points && n.lines && n.rays) {
              scope.top.allowAll = true;
            } else {
              scope.top.allowAll = undefined;
            }

            var firstType;
            for (var k in scope.fullModel.config.availableTypes) {
              if (scope.fullModel.config.availableTypes[k] === true) {
                firstType = k;
                break;
              }
            }

            scope.fullModel.model.config.initialType = firstType;

          }
        }, true);

        scope.$watch('initialView.responseModel', debounce(updateInitialElements), true);

        scope.$watch('correctResponseView.responseModel', debounce(updateCorrectResponse), true);

        scope.$watch('fullModel.model.config', debounce(updateNumberLineOptions), true);

        scope.$watch('sampleNumberLine.model.config', debounce(updateTickLabels), true);

        scope.resetToDefaults = function() {
          _.extend(scope.fullModel.model.config, _.omit(scope.defaults, 'exhibitOnly'));
          scope.initialView.model.config.tickLabelOverrides = _.cloneDeep(scope.fullModel.model.config.tickLabelOverrides);
          scope.correctResponseView.model.config.tickLabelOverrides = _.cloneDeep(scope.fullModel.model.config.tickLabelOverrides);
          scope.sampleNumberLine.model.config.tickLabelOverrides = _.cloneDeep(scope.fullModel.model.config.tickLabelOverrides);
        };

        scope.stopTickEditing = function() {
          scope.isEditingTickLabel = false;
        };

        scope.tickEditKeyup = function(event) {
          if (event.keyCode === 13) {
            scope.stopTickEditing();
          }
        };

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      },
      template: [
        '<div class="config-number-line" ng-click="stopTickEditing($event)">',
        '  <div navigator-panel="Design">',
        '  <p>',
        '    In this interaction, students plot points, line segments or rays on a number line.',
        '  </p>',
        attributes,
        initialView,
        correctResponseView,
        display,
        feedback,
        '  </div>',
        '  <div navigator-panel="Scoring">',
        ChoiceTemplates.scoring(),
        '  </div>',

        '</div>',
        '</div>'
      ].join("")
    };

  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
