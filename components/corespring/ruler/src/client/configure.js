var main = [
  function() {
    "use strict";
    var designPanel = [
      '<div class="row">',
      ' <div class="col-md-12">',
      '   <div class="body">',
      '     <p>A ruler may be displayed to students. It can be moved and rotated within the player space.</p>',
      '     <div class="form-horizontal" role="form">',
      '       <div class="form-group">',
      '         <label class="col-sm-5 control-label">Type</label>',
      '         <div class="col-sm-7">',
      '           <label class="radio-inline">',
      '             <input type="radio" name="type" value="imperial" ng-model="model.config.units" ng-change="handleUnitsChange()">',
      '             Imperial',
      '           </label>',
      '           <label class="radio-inline">',
      '             <input type="radio" name="type" value="metric" ng-model="model.config.units" ng-change="handleUnitsChange()">',
      '             Metric',
      '           </label>',
      '         </div>',
      '       </div>',
      '       <div class="form-group">',
      '         <label class="col-sm-5 control-label">Label</label>',
      '         <div class="col-sm-3">',
      '           <select class="form-control" ng-model="model.config.label" ng-switch on="model.config.units">',
      '             <option value="">None</option>',
      '             <option value="in" ng-switch-when="imperial">Inches</option>',
      '             <option value="ft" ng-switch-when="imperial">Feet</option>',
      '             <option value="yd" ng-switch-when="imperial">Yards</option>',
      '             <option value="mi" ng-switch-when="imperial">Miles</option>',
      '             <option value="mm" ng-switch-when="metric">Millimeters</option>',
      '             <option value="cm" ng-switch-when="metric">Centimeters</option>',
      '             <option value="m" ng-switch-when="metric">Meters</option>',
      '             <option value="km" ng-switch-when="metric">Kilometers</option>',
      '           </select>',
      '         </div>',
      '       </div>',
      '       <div class="form-group">',
      '         <label class="col-sm-5 control-label">Length</label>',
      '         <div class="col-sm-2">',
      '           <input class="form-control" type="number" ng-model="model.config.length" />',
      '         </div>',
      '       </div>',
      '       <div class="form-group">',
      '         <label class="col-sm-5 control-label">Number of Ticks</label>',
      '         <div class="col-sm-2">',
      '           <select class="form-control" ng-model="model.config.ticks">',
      '             <option value="1">1</option>',
      '             <option value="2">2</option>',
      '             <option value="4">4</option>',
      '             <option value="8">8</option>',
      '             <option value="10">10</option>',
      '             <option value="16">16</option>',
      '           </select>',
      '         </div>',
      '       </div>',
      '       <div class="form-group">',
      '         <label class="col-sm-5 control-label">*Scale</label>',
      '         <div class="col-sm-2">',
      '           <input class="form-control" type="number" ng-model="model.config.pixelsPerUnit" />',
      '         </div>',
      '         <div class="col-sm-2 make-inline">',
      '           <p class="form-control-static">Pixels per unit</p>',
      '         </div>',
      '       </div>',
      '       <div class="form-group">',
      '         <div class="col-sm-offset-4 col-sm-5">',
      '           <p class="form-control-static"><small><i>*Use this option to scale the ruler to an image. A unit is defined as the distance between two major ticks. For example, if the image measures 150 pixels wide, scaling to 50 pixels will equal 3 inches.</i></small><p>',
      '         </div>',
      '       </div>',
      '     </div>',
      '   </div>',
      ' </div>',
      '</div>'
    ].join("\n");

    var panels = [
      '<div class="cs-ruler-config">',
        designPanel,
      '</div>'
    ].join("\n");

    return {
      scope: {},
      restrict: 'E',
      replace: true,
      template: panels,
      link: function(scope, element, attrs) {
        var defaultImperialData = {
          label: "in",
          length: 12,
          ticks: 16,
          pixelsPerUnit: 40
        },
        defaultMetricData = {
          label: "cm",
          length: 20,
          ticks: 10,
          pixelsPerUnit: 30
        };
        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            scope.model = scope.fullModel.model;
            scope.handleUnitsChange = function() {
              if (scope.model.config.units === "imperial") {
                _.assign(scope.model.config, defaultImperialData);
              } else {
                _.assign(scope.model.config, defaultMetricData);
              }
            };
          }
        };
        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);
      }
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
