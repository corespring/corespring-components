var main = [
  '$log', 'ChoiceTemplates', 'ComponentDefaultData',
  function($log, ChoiceTemplates, ComponentDefaultData) {

    return {
      scope: false,
      restrict: 'E',
      replace: true,
      link: link,
      template: template()
    };


    function link(scope, element, attrs) {

      var points = ['PF', 'PE'];
      var lines = ['LEE', 'LEF', 'LFE', 'LFF'];
      var rays = ['REP', 'REN', 'RFP', 'RFN'];

      scope.defaults = ComponentDefaultData.getDefaultData('corespring-number-line', 'model.config');

      ChoiceTemplates.extendScope(scope, 'corespring-number-line');

      scope.top = {};

      scope.configGraphOptions = {
        startOverClearsGraph: true,
        undoDisabled: true
      };

      scope.sampleGraphOptions = {
        placeholderForEmptyTickLabel: "N/A",
        labelCursor: 'pointer',
        explicitHeight: 30
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

      scope.correctResponseView = _.cloneDeep(scope.initialView);

      scope.sampleNumberLine = _.merge(_.cloneDeep(scope.initialView), {
        model: {
          config: {
            maxNumberOfPoints: 1
          }
        },
        editable: false
      });

      scope.displayAll = displayAll;
      scope.displayNone = displayNone;
      scope.isActive = isActive;
      scope.resetToDefaults = resetToDefaults;
      scope.select = select;
      scope.stopTickEditing = stopTickEditing;
      scope.tickEditKeyup = tickEditKeyup;
      scope.tickLabelClick = tickLabelClick;


      scope.$watch(function() {
        return _.omit(scope.fullModel.model.config, 'initialElements');
      }, debounce(updateNumberLineOptions), true);

      scope.$watch('correctResponseView.responseModel', debounce(updateCorrectResponse), true);
      scope.$watch('initialView.responseModel', debounce(updateInitialElements), true);
      scope.$watch('sampleNumberLine.model.config', debounce(updateTickLabels), true);

      scope.containerBridge = {
        setModel: setModel,
        getModel: getModel
      };

      scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

      //---------------------------------------------------------

      function setModel(model) {
        scope.fullModel = model;
        var correctResponses = model.correctResponse || [];
        scope.initialView.model.config.initialElements = _.cloneDeep(model.model.config.initialElements);
        scope.correctResponseView.model.config.initialElements = _.cloneDeep(correctResponses);
        scope.updateNumberOfCorrectResponses(correctResponses.length);
        scope.sampleNumberLine.model.config.tickLabelOverrides = _.cloneDeep(model.model.config.tickLabelOverrides);
      }

      function getModel() {
        return scope.fullModel;
      }

      function tickLabelClick(tick, x) {
        var overrides = scope.sampleNumberLine.model.config.tickLabelOverrides || [];
        scope.sampleNumberLine.model.config.tickLabelOverrides = overrides;

        var override = _.find(overrides, function(t) {
          return t.tick === tick;
        });

        if (_.isUndefined(override)) {
          overrides.push({
            tick: tick,
            label: tick.toFixed(2)
          });
          override = _.last(overrides);
        }
        scope.isEditingTickLabel = true;
        scope.tickLabelEditingPosition = x + 5;
        scope.tickBeingEdited = override;
        scope.$apply();
      }

      function updateInitialElements(n) {
        scope.$apply(function() {
          scope.fullModel.model.config.initialElements = _.cloneDeep(n);
        });
      }

      function updateCorrectResponse(n) {
        scope.$apply(function() {
          scope.fullModel.correctResponse = _.cloneDeep(n);
          scope.updateNumberOfCorrectResponses((n || []).length);
        });
      }

      function updateNumberLineOptions(n, onlyFor) {
        if (n) {
          scope.correctResponseView.model.config.initialElements = _.cloneDeep(scope.correctResponseView.responseModel);
          scope.initialView.model.config.initialElements = _.cloneDeep(scope.initialView.responseModel);
          scope.$apply(function() {
            _(n).omit('initialElements', 'tickLabelOverrides', 'exhibitOnly').each(function(e, k) {
              if (!_.isUndefined(n[k])) {
                scope.initialView.model.config[k] = _.cloneDeep(n[k]);
                scope.correctResponseView.model.config[k] = _.cloneDeep(n[k]);
                scope.sampleNumberLine.model.config[k] = _.cloneDeep(n[k]);
                scope.fullModel.model.config[k] = _.cloneDeep(n[k]);
              }
            });
          });
        }
      }

      function updateTickLabels(n) {
        if (n) {
          scope.$apply(function() {
            scope.initialView.model.config.tickLabelOverrides = _.cloneDeep(n.tickLabelOverrides);
            scope.correctResponseView.model.config.tickLabelOverrides = _.cloneDeep(n.tickLabelOverrides);
            scope.sampleNumberLine.model.tickLabelOverrides = _.cloneDeep(n.tickLabelOverrides);
            scope.fullModel.model.config.tickLabelOverrides = _.cloneDeep(n.tickLabelOverrides);
          });
        }
      }

      function debounce(fn) {
        return _.debounce(fn, 500, {
          trailing: true,
          leading: false
        });
      }

      function resetToDefaults() {
        _.extend(scope.fullModel.model.config, _.omit(scope.defaults, 'exhibitOnly'));
        scope.initialView.model.config.tickLabelOverrides = _.cloneDeep(scope.fullModel.model.config.tickLabelOverrides);
        scope.correctResponseView.model.config.tickLabelOverrides = _.cloneDeep(scope.fullModel.model.config.tickLabelOverrides);
        scope.sampleNumberLine.model.config.tickLabelOverrides = _.cloneDeep(scope.fullModel.model.config.tickLabelOverrides);
      }

      function stopTickEditing() {
        scope.isEditingTickLabel = false;
      }

      function tickEditKeyup(event) {
        if (event.keyCode === 13) {
          scope.stopTickEditing();
        }
      }

      function isActive(type) {
        return scope.fullModel.model.config.availableTypes[type] === true;
      }

      function select(type) {
        scope.fullModel.model.config.availableTypes[type] = !!!scope.fullModel.model.config.availableTypes[type];
      }

      function displayAll() {
        _.each(_.flatten([points, rays, lines]), function(key) {
          scope.fullModel.model.config.availableTypes[key] = true;
        });
      }

      function displayNone() {

        function responseToType(response) {
          return (response.type[0] +
            (response.pointType ? response.pointType[0] : '') +
            (response.leftPoint ? response.leftPoint[0] : '') +
            (response.rightPoint ? response.rightPoint[0] : '') +
            (response.direction ? response.direction[0] : '')).toUpperCase();
        }

        var requiredTypes = _.chain(scope.fullModel.correctResponse).map(responseToType).uniq().value();

        _.each(_.flatten([points, rays, lines]), function(key) {
          scope.fullModel.model.config.availableTypes[key] = requiredTypes.indexOf(key) >= 0;
        });
      }
    }

    function template() {
      var attributes = [
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <h3>Number Line Attributes</h3>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <p>',
        '      Set up the number line by entering the domain and number of tick marks to display. Labels on the number',
        '      line can be edited or removed by clicking on the label.',
        '    </p>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12 graph-config">',
        '    <div interactive-graph',
        '        ngModel="sampleNumberLine.model"',
        '        responseModel="sampleNumberLine.responseModel"',
        '        options="sampleGraphOptions"',
        '        tickLabelClick="tickLabelClick"',
        '        editable="sampleNumberLine.editable">',
        '    </div>',
        '    <div class="tick-label-override-input-holder" ng-show="isEditingTickLabel">',
        '      <input ng-model="tickBeingEdited.label" ng-click="$event.stopImmediatePropagation()" ng-keyup="tickEditKeyup($event)" type="text" class="tick-label-override-input" style="left: {{tickLabelEditingPosition}}px"/>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div class="row domain-row">',
        '  <div class="col-xs-12">',
        '    Domain = <input type="number" class="form-control" ng-model="fullModel.model.config.domain[0]"/> to <input type="number" class="form-control" ng-model="fullModel.model.config.domain[1]"/>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    Number of Ticks: <input type="number" class="form-control" ng-model="fullModel.model.config.tickFrequency"/>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <checkbox ng-model="fullModel.model.config.showMinorTicks">Display minor tick marks</checkbox>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    Minor tick frequency: <input type="number" class="form-control" ng-model="fullModel.model.config.snapPerTick"/>',
        '  </div>',
        '</div>',
        '<div class="row">',
        '  <div class="col-xs-12">',
        '    <a class="reset-defaults btn btn-default" ng-click="resetToDefaults()">Reset to default values</a>',
        '  </div>',
        '</div>'
      ].join('');

      var correctResponseView = [
        '<div ng-hide="fullModel.model.config.exhibitOnly">',
        '<h3>Correct Response</h3>',
        '    <p>',
        '      Select answer type and place it on the number line. Intersecting points, line segments and/or rays',
        '      will appear above the number line. <i>Note: A maximum of 20 points, line segments or rays may be',
        '      plotted.</i>',
        '    </p>',
        '    <div class="centered-graph-holder">',
        '      <div class="centered-graph" interactive-graph',
        '           ngModel="correctResponseView.model"',
        '           responseModel="correctResponseView.responseModel"',
        '           options="configGraphOptions"',
        '           editable="correctResponseView.editable">',
        '      </div>',
        '    </div>',
        '</div>'
      ].join('');

      var display = [
        '<div class="display-panel"',
        '    ng-hide="fullModel.model.config.exhibitOnly"',
        '    collapsable-panel',
        '    collapsable-panel-title="Display">',
        '  <p>Click on the input options to be displayed to the students. All inputs will display by default.</p>',
        '  <div class="element-selector text-center">',
        '    <span role="presentation" class="element-pf" ng-mousedown="select(\'PF\')">',
        '      <a ng-class="{active: isActive(\'PF\')}">&nbsp;</a>',
        '    </span>',
        '    <span role="presentation" class="element-pe" ng-mousedown="select(\'PE\')">',
        '      <a ng-class="{active: isActive(\'PE\')}">&nbsp;</a>',
        '    </span>',
        '    <span role="presentation" class="element-lff" ng-mousedown="select(\'LFF\')">',
        '      <a ng-class="{active: isActive(\'LFF\')}">&nbsp;</a>',
        '    </span>',
        '    <span role="presentation" class="element-lef" ng-mousedown="select(\'LEF\')">',
        '      <a ng-class="{active: isActive(\'LEF\')}">&nbsp;</a>',
        '    </span>',
        '    <span role="presentation" class="element-lfe" ng-mousedown="select(\'LFE\')">',
        '      <a ng-class="{active: isActive(\'LFE\')}">&nbsp;</a>',
        '    </span>',
        '    <span role="presentation" class="element-lee" ng-mousedown="select(\'LEE\')">',
        '      <a ng-class="{active: isActive(\'LEE\')}">&nbsp;</a>',
        '    </span>',
        '    <span role="presentation" class="element-rfn" ng-mousedown="select(\'RFN\')">',
        '      <a ng-class="{active: isActive(\'RFN\')}">&nbsp;</a>',
        '    </span>',
        '    <span role="presentation" class="element-rfp" ng-mousedown="select(\'RFP\')">',
        '      <a ng-class="{active: isActive(\'RFP\')}" >&nbsp;</a>',
        '    </span>',
        '    <span role="presentation" class="element-ren" ng-mousedown="select(\'REN\')">',
        '      <a ng-class="{active: isActive(\'REN\')}">&nbsp;</a>',
        '    </span>',
        '    <span role="presentation" class="element-rep" ng-mousedown="select(\'REP\')">',
        '      <a ng-class="{active: isActive(\'REP\')}">&nbsp;</a>',
        '    </span>',
        '  </div>',
        '  <p>',
        '    <button class="btn btn-default" ng-click="displayAll()">Display All</button>',
        '    <button class="btn btn-default" ng-click="displayNone()">None</button>',
        '  </p>',
        '</div>'
      ].join('');

      var initialView = [
        '<div class="exhibit-panel" collapsable-panel collapsable-panel-title="Initial view / Make Exhibit">',
        '  <p>Use this number line to set a starting point, line segment or ray. This is optional.</p>',
        '  <p>This number line may also be used to make an exhibit number line, which can not be manipulated by a student.</p>',
        '  <checkbox ng-model="fullModel.model.config.exhibitOnly">Make exhibit</checkbox>',
        '  <div class="centered-graph-holder">',
        '    <div class="centered-graph" interactive-graph',
        '         ngModel="initialView.model"',
        '         options="configGraphOptions"',
        '         responseModel="initialView.responseModel"',
        '         editable="initialView.editable"',
        '         colors="initialView.colors">',
        '     </div>',
        '   </div>',
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

      return [
        '<div class="config-number-line" ng-click="stopTickEditing($event)">',
        '  <div navigator-panel="Design">',
        '    <div class="container-fluid">',
        '      <p>',
        '        In this interaction, students plot points, line segments or rays on a number line.',
        '      </p>',
        attributes,
        correctResponseView,
        display,
        initialView,
        feedback,
        '    </div>',
        '  </div>',
        '  <div navigator-panel="Scoring">',
        ChoiceTemplates.scoring(),
        '  </div>',
        '</div>',
        '</div>'
      ].join("");
    }
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];