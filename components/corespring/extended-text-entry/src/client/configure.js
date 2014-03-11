var main = [
  function() {
    var promptBlock =  [
      '<div class="input-holder">',
      '  <div class="header">Prompt</div>',
      '  <div class="body">',
      '    <textarea ck-editor ng-model="fullModel.model.prompt"></textarea>',
      '  </div>',
      '</div>'].join('\n');

    var configurationBlock = [
      '<div class="input-holder">',
      '  <div class="header">Configuration</div>',
      '  <div class="body">',
      '     <form class="form-horizontal" role="form">',
      '       <div class="form-group">',
      '         <label for="ignore-case" class="col-sm-2 control-label">Expected Length</label>',
      '         <div class="col-sm-10">',
      '           <input type="text" id="expected-length" class="form-control"  ng-model="fullModel.model.config.expectedLength" />',
      '         </div>',
      '       </div>',
      '       <div class="form-group">',
      '         <label for="ignore-whitespace" class="col-sm-2 control-label">Expected Lines</label>',
      '         <div class="col-sm-10">',
      '           <input type="text" id="expected-lines" class="form-control"  ng-model="fullModel.model.config.expectedLines" />',
      '         </div>',
      '       </div>',
      '     </form>',
      '  </div>',
      '</div>'].join('\n');

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        scope.containerBridge = {
          setModel: function(model) {
            scope.fullModel = model;
            model.model = model.model || {};
            model.model.config = model.model.config || {};
          },

          getModel: function() {
            return scope.fullModel;
          }
        };

        scope.registerConfigPanel(attrs.id, scope.containerBridge);
      },
      template: [
        '<div class="extended-text-entry-configuration">',
        promptBlock,
        configurationBlock,
        '</div>'
      ].join('\n')
    };
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
