var main = [
  function() {

    var link = function() {
      return function(scope, element, attrs) {

        var addEmptyFunctions = function(obj, fns) {
          _.each(fns, function(fn) {
            obj[fn] = function() {
            };
          });
        };

        scope.containerBridge = {
          setDataAndSession: function(dataAndSession) {
            scope.model = dataAndSession.data.model;
            scope.session = dataAndSession.session || {};
          },
          getSession: function() {
            return {
            };
          }
        };

        addEmptyFunctions(scope.containerBridge, ['setResponse', 'setMode', 'reset', 'answerChangedHandler', 'editable']);

        scope.$emit('registerComponent', attrs.id, scope.containerBridge);        
      };
    };

    function template() {
      return [
        '<div class="cs-calculator" ng-switch on="model.config.type">',
        '  <calculator-basic ng-switch-default></calculator-basic>',
        '  <calculator-scientific ng-switch-when="scientific"></calculator-scientific>',
        '  <calculator-graphing ng-switch-when="graphing"></calculator-graphing>',      
        '</div>'
      ].join("\n");
    }

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: template()
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
