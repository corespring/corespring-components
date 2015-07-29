var main = [
  function() {

    "use strict";

    
    var designPanel = [
      '<div class="row">',
      '  <div class="col-md-12">',
      '    <div class="body">',
      '      <div class="description">',
      '        <div>Choose a calculator</div>',
      '      </div>',
      '      <div class="split-container">',
      '        <form class="split-left" role="form">',
      '          <div class="cs-calculator-row clearfix">',
      '            <div class="col-sm-2">',
      '              <radio id="basicRadio" value="basic" ng-model="fullModel.model.config.type">Basic</radio>',
      '              <radio id="scientificRadio" value="scientific" ng-model="fullModel.model.config.type">Scientific</radio>',      
      '            </div>',
      '            <div class="col-sm-6">',
      '              <div class="preview_{{ fullModel.model.config.type }}"></div>',
      '            </div>',
      '          </div>',
      '          <div class="cs-calculator-row note">',
      '            <i>Please note that the calculators are tools for students and do not record answers.</i>',
      '          </div>',
      '        </form>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    var panels = [
      '<div class="cs-calculator-config">',
        designPanel,
      '</div>'
    ].join("\n");

    return {
      scope: {},
      restrict: 'E',
      replace: true,
      template: panels,
      link: function(scope, element, attrs) {
        scope.containerBridge = {
          setModel: function(fullModel) {
            scope.fullModel = fullModel;
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
