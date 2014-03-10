var main = [
  function() {

    var correctResponseBlock = [
      '<div class="input-holder">',
      '  <div class="header">Correct Response</div>',
      '  <div class="body">',
      '     <div ng-repeat="cr in fullModel.correctResponse track by $index" class="correct-holder">',
      '       <input class="form-control text-input" type="text"  ng-model="$parent.fullModel.correctResponse[$index]" />',
      '       <button type="button" class="close remove-button" ng-click="removeCorrectResponseWithIndex($index)">&times;</button>',
      '     </div>',
      '     <a href="" ng-click="addCorrectResponse()">Add correct response</a>',
      '  </div>',
      '</div>'].join('\n');

    var configurationBlock = [
      '<div class="input-holder">',
      '  <div class="header">Configuration</div>',
      '  <div class="body">',
      '     <div>',
      '       <div>',
      '         <input type="checkbox" id="ignore-case" ng-model="fullModel.model.config.ignoreCase" />',
      '         <label for="ignore-case">Ignore Case</label>',
      '       </div>',
      '       <div>',
      '         <input type="checkbox" id="ignore-whitespace" ng-model="fullModel.model.config.ignoreWhitespace" />',
      '         <label for="ignore-whitespace">Ignore Whitespace</label>',
      '       </div>',
      '     </div>',
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

        scope.addCorrectResponse = function() {
          scope.fullModel.correctResponse = scope.fullModel.correctResponse || [];
          scope.fullModel.correctResponse.push("");
        };

        scope.removeCorrectResponseWithIndex = function(idx) {
          scope.fullModel.correctResponse = _.filter(scope.fullModel.correctResponse, function(cr, i) {
             return idx !== i;
          });
        };

      },
      template: [
        '<div class="short-text-entry-configuration">',
        correctResponseBlock,
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
