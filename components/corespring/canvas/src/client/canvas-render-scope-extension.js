exports.framework = "angular";
exports.factory = [
  '$log',
  function($log) {

    "use strict";

    function CanvasRenderScopeExtension() {

      this.postLink = function(scope) {

        scope.createGraphAttributes = function(config, maxPoints, graphCallback) {
          function getModelValue(property, defaultValue, fallbackValue) {
            if (typeof property !== 'undefined' && property !== null) {
              return property;
            } else {
              if (typeof fallbackValue !== 'undefined' && property !== null) {
                return fallbackValue;
              } else {
                return defaultValue;
              }
            }
          }

          return {
            "jsx-graph": "",
            "graph-callback": graphCallback || "graphCallback",
            "interaction-callback": "interactionCallback",
            "hovered-line": "hoveredLine",
            maxPoints: maxPoints,
            domainLabel: config.domainLabel,
            domainMin: parseFloat(getModelValue(config.domainMin, -10, config.domain * -1), 10),
            domainMax: parseFloat(getModelValue(config.domainMax, 10, config.domain), 10),
            domainStepValue: parseFloat(getModelValue(config.domainStepValue, 1)),
            domainSnapValue: parseFloat(getModelValue(config.domainSnapValue, 1)),
            domainLabelFrequency: parseFloat(getModelValue(config.domainLabelFrequency, 1, config.tickLabelFrequency), 10),
            domainGraphPadding: parseInt(getModelValue(config.domainGraphPadding, 50), 10),
            rangeLabel: config.rangeLabel,
            rangeMin: parseFloat(getModelValue(config.rangeMin, -10, config.range * -1)),
            rangeMax: parseFloat(getModelValue(config.rangeMax, 10, config.range * 1)),
            rangeStepValue: parseFloat(getModelValue(config.rangeStepValue, 1)),
            rangeSnapValue: parseFloat(getModelValue(config.rangeSnapValue, 1)),
            rangeLabelFrequency: parseFloat(getModelValue(config.rangeLabelFrequency, 1, config.tickLabelFrequency, 10)),
            rangeGraphPadding: parseInt(getModelValue(config.rangeGraphPadding, 50), 10),
            showLabels: !_.isUndefined(config.showLabels) ? config.showLabels : true,
            showCoordinates: !_.isUndefined(config.showCoordinates) ? config.showCoordinates : true,
            showPoints: !_.isUndefined(config.showPoints) ? config.showPoints : true,
            showAxisLabels: !_.isUndefined(config.showAxisLabels) ? config.showAxisLabels : true,
            pointLabels: !!config.showInputs ? "letters" : "none"
          };
        };
      };
    }

    return CanvasRenderScopeExtension;
  }
];
