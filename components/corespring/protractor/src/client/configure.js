var main = [
  function() {

    "use strict";

    
    var designPanel = [
      '<div class="row">',
      '  <div class="col-md-12">',
      '    <div class="body">',
      '      <p>A protractor may be displayed to students that can be moved and rotated within the space.</p>',
      '      <p align="center"><img src="//ka-perseus-graphie.s3.amazonaws.com/e9d032f2ab8b95979f674fbfa67056442ba1ff6a.png" /></p>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    var panels = [
      '<div class="cs-protractor-config">',
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