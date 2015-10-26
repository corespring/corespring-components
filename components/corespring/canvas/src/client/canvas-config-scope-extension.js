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
          reset('graphWidth', defaults.graphWidth);
          reset('graphHeight', defaults.graphHeight);

          reset('showCoordinates', defaults.showCoordinates);
          reset('showInputs', defaults.showInputs);
          reset('showAxisLabels', defaults.showAxisLabels);
          reset('showFeedback', defaults.showFeedback);
        };
      };
    }

    return CanvasConfigScopeExtension;
  }
];
