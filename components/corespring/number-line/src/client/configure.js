var main = [
  '$log','ChoiceTemplates',
  function($log,ChoiceTemplates) {

    var attributes = [
      '  <h3>Number Line Attributes</h3>',
      '  <checkbox ng-model="fullModel.model.config.exhibitOnly">Make exhibit</checkbox>',
      '  <div>',
      '     Domain = <input type="number" class="form-control fixed-input-100" ng-model="fullModel.model.config.domain[0]"/> to <input type="number" class="form-control fixed-input-100" ng-model="fullModel.model.config.domain[1]"/>',
      '  </div>',
      '  <div>Number of Ticks: <input type="number" class="form-control fixed-input-100" ng-model="fullModel.model.config.tickFrequency"/></div>',
      '  <checkbox ng-model="fullModel.model.config.showMinorTicks">Display minor tick marks</checkbox>',
      '  <div>Minor tick frequency: <input type="number" class="form-control fixed-input-100" ng-model="fullModel.model.config.snapPerTick"/></div>',
      '  <div><a class="reset-defaults btn btn-default" ng-click="resetDefaults()">Reset to default values</a></div>',
    ].join('');

    var initialView = [
      '<h3>Initial view</h3>',
      '  <div interactive-graph',
      '       ngModel="initialView.model"',
      '       responseModel="initialView.responseModel"',
      '       editable="initialView.editable"',
      '       colors="initialView.colors"></div>',

    ].join('');

    var correctResponseView = [
      '<h3>Correct Response</h3>',
      '  <div interactive-graph',
      '       ngModel="correctResponseView.model"',
      '       responseModel="correctResponseView.responseModel"',
      '       editable="correctResponseView.editable"></div>',

    ].join('');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        ChoiceTemplates.extendScope(scope, 'corespring-number-line');
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

        scope.correctResponseView = _.cloneDeep(scope.initialView);
        scope.correctResponseView.responseModel = {};

        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            scope.initialView.model.config.initialElements = _.cloneDeep(model.model.config.initialElements);
            scope.correctResponseView.model.config.initialElements = _.cloneDeep(model.correctResponse);
          },

          getModel: function() {
            return scope.fullModel;
          }
        };

        var updateInitialElements = function(n) {
          scope.$apply(function() {
            scope.fullModel.model.config.initialElements = _.cloneDeep(n);
          });
        };

        var updateCorrectResponse = function(n) {
          scope.$apply(function() {
            scope.fullModel.correctResponse = _.cloneDeep(n);
            scope.updatePartialScoringModel(scope.correctResponseView.responseModel.length);
          });
        };

        function debounce(fn) {
          return _.debounce(fn, 500, {
            trailing: true,
            leading: false
          });
        }

        scope.$watch('initialView.responseModel', debounce(updateInitialElements), true);

        scope.$watch('correctResponseView.responseModel', debounce(updateCorrectResponse), true);

        scope.$watch('fullModel.model.config', function(n) {
          if (n) {
            _(n).omit('initialElements').each(function(e, k) {
              if (!_.isUndefined(n[k])) {
                scope.initialView.model.config[k] = n[k];
                scope.correctResponseView.model.config[k] = n[k];
              }
            });
          }
        }, true);

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

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      },
      template: [
        '<div class="config-number-line">',
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
