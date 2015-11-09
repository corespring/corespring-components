exports.framework = "angular";
exports.factory = [
  '$log',
  function($log) {

    "use strict";

    function CanvasConfigScopeExtension() {

      this.postLink = function(scope) {

        var defaults = scope.defaults;

        function reset(property, value) {
          scope.fullModel.model.config[property] = value;
        }

        scope.resetCanvasGraphAttributes = function() {

          // graph attributes
          reset('domainMin', defaults.domainMin);
          reset('domainMax', defaults.domainMax);
          reset('domainLabel', defaults.domainLabel);
          reset('domainStepValue', defaults.domainStepValue);
          reset('domainSnapValue', defaults.domainSnapValue);
          reset('domainLabelFrequency', defaults.domainLabelFrequency);
          reset('domainGraphPadding', defaults.domainGraphPadding);

          reset('rangeMin', defaults.rangeMin);
          reset('rangeMax', defaults.rangeMax);
          reset('rangeLabel', defaults.rangeLabel);
          reset('rangeStepValue', defaults.rangeStepValue);
          reset('rangeSnapValue', defaults.rangeSnapValue);
          reset('rangeLabelFrequency', defaults.rangeLabelFrequency);
          reset('rangeGraphPadding', defaults.rangeGraphPadding);

          // significant figures
          reset('sigfigs', defaults.sigfigs);
        };

        scope.resetCanvasDisplayAttributes = function() {

          // display
          reset('graphTitle', defaults.graphTitle);
          reset('graphWidth', defaults.graphWidth);
          reset('graphHeight', defaults.graphHeight);

          reset('showCoordinates', defaults.showCoordinates);
          reset('showPointLabels', defaults.showPointLabels);
          reset('showInputs', defaults.showInputs);
          reset('showAxisLabels', defaults.showAxisLabels);
          reset('showFeedback', defaults.showFeedback);
        };

        scope.checkUndefinedProperties = function(config) {
          config.showAxisLabels = _.isUndefined(config.showAxisLabels) ? true : config.showAxisLabels;
          config.showPointLabels = _.isUndefined(config.showPointLabels) ? true : config.showPointLabels;
        };

        scope.$watch('fullModel.model.config.domainMin', function (newVal, oldVal) {
          if (!_.isUndefined(newVal)) {
            if(!_.isNumber(newVal) || newVal > 0 || newVal >= scope.fullModel.model.config.domainMax) {
              scope.fullModel.model.config.domainMin = oldVal;
            }
          }
        }, false);

        scope.$watch('fullModel.model.config.domainMax', function (newVal, oldVal) {
          if (!_.isUndefined(newVal)) {
            if(!_.isNumber(newVal) || newVal < 0 || newVal <= scope.fullModel.model.config.domainMin) {
              scope.fullModel.model.config.domainMax  = oldVal;
            }
          }
        }, false);

        scope.$watch('fullModel.model.config.rangeMin', function (newVal, oldVal) {
          if (!_.isUndefined(newVal)) {
            if(!_.isNumber(newVal) || newVal > 0 || newVal >= scope.fullModel.model.config.rangeMax) {
              scope.fullModel.model.config.rangeMin = oldVal;
            }
          }
        }, false);

        scope.$watch('fullModel.model.config.rangeMax', function (newVal, oldVal) {
          if (!_.isUndefined(newVal)) {
            if(!_.isNumber(newVal) || newVal < 0 || newVal <= scope.fullModel.model.config.rangeMin) {
              scope.fullModel.model.config.rangeMax = oldVal;
            }
          }
        }, false);
      };
    }

    return CanvasConfigScopeExtension;
  }
];
