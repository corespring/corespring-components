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
      '       Domain = <input type="number" class="form-control fixed-input-100" ng-model="fullModel.model.config.domain[0]"/> to <input type="number" class="form-control fixed-input-100" ng-model="fullModel.model.config.domain[1]"/>',
      '    </div>',
      '    <div>Number of Ticks: <input type="number" class="form-control fixed-input-100" ng-model="fullModel.model.config.tickFrequency"/></div>',
      '    <checkbox ng-model="fullModel.model.config.showMinorTicks">Display minor tick marks</checkbox>',
      '    <div>Minor tick frequency: <input type="number" class="form-control fixed-input-100" ng-model="fullModel.model.config.snapPerTick"/></div>',
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
      '    </td>',
      '  </tr>',
      '</table>'
    ].join('');

    var initialView = [
      '<h3>Initial view</h3>',
      '  <div interactive-graph',
      '       ngModel="initialView.model"',
      '       options="configGraphOptions"',
      '       responseModel="initialView.responseModel"',
      '       editable="initialView.editable"',
      '       colors="initialView.colors"></div>'

    ].join('');

    var correctResponseView = [
      '<div ng-hide="fullModel.model.config.exhibitOnly">',
      '<h3>Correct Response</h3>',
      '  <div interactive-graph',
      '       ngModel="correctResponseView.model"',
      '       responseModel="correctResponseView.responseModel"',
      '       options="configGraphOptions"',
      '       editable="correctResponseView.editable"></div>',
      '</div>'
    ].join('');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        scope.defaults = scope.data.defaultData.model.config;
        ChoiceTemplates.extendScope(scope, 'corespring-number-line');
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

        scope.$watch('initialView.responseModel', debounce(updateInitialElements), true);

        scope.$watch('correctResponseView.responseModel', debounce(updateCorrectResponse), true);

        scope.$watch('fullModel.model.config', debounce(updateNumberLineOptions), true);

        scope.$watch('sampleNumberLine.model.config', debounce(updateTickLabels), true);

        // Temporary way to test the interaction
        scope.$watch('fullModel', function(n) {
          if (n) {
            scope.modelJson = JSON.stringify(n, null, 2);
          }
        }, true);

        scope.$watch("modelJson", _.debounce(function(json) {
          if (!_.isUndefined(json)) {
            scope.$apply(function() {
              var newModel = JSON.parse(json);
              _.merge(scope.fullModel, newModel);
              scope.fullModel.correctResponse = newModel.correctResponse;
              scope.fullModel.model.objects = newModel.model.objects;
            });
          }
        }, 200));

        scope.resetToDefaults = function() {
//          _.merge(scope.fullModel.model.config, _.pick(scope.defaults, ['domain','tickFrequency','snapPerTick']));
          _.extend(scope.fullModel.model.config, _.omit(scope.defaults, 'exhibitOnly'));
//          scope.fullModel.model.config = _.omit(scope.defaults, 'exhibitOnly');
          scope.initialView.model.config.tickLabelOverrides = _.cloneDeep(scope.fullModel.model.config.tickLabelOverrides);
          scope.correctResponseView.model.config.tickLabelOverrides = _.cloneDeep(scope.fullModel.model.config.tickLabelOverrides);
          scope.sampleNumberLine.model.config.tickLabelOverrides = _.cloneDeep(scope.fullModel.model.config.tickLabelOverrides);

        };

        scope.stopTickEditing = function(event) {
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
        '    In Number Line, students identify coordinates or plot points on a graph by clicking on the graph.',
        '  </p>',
        attributes,
        initialView,
        correctResponseView,
        '  </div>',
        '  <div navigator-panel="DevMode">',
        '    <textarea cols="100" rows="50" ng-model="modelJson"></textarea>',
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
