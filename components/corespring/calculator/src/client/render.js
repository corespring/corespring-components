/* global console,exports */
var main = [
  function () {

    var template = function() {      
      return [
        '<div class="cs-calculator">',
        '  <div class="cs-calculator-toggle" ng-class="{visible: isVisible}" ng-click="toggleVisibility()" title="Click to {{isVisible ? \'hide\' : \'show\'}}"></div>',
        '  <calculator-template ng-show="isVisible" calculator-type="{{ model.config.type }}" on-close-callback="toggleVisibility()" data-drag="true" jqyoui-draggable="{animate:true}" data-jqyoui-options="draggableOptions()"></calculator-template>',        
        '</div>'
      ].join("\n");
    };

    var link = function(scope, element, attrs) {
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
          scope.isVisible = false;
        }
      };

      addEmptyFunctions(scope.containerBridge, ['setResponse', 'setMode', 'reset', 'answerChangedHandler', 'editable', 'isAnswerEmpty', 'getSession']);

      scope.draggableOptions = function() {
        return {
          containment: element.closest('.player-container')
        };
      };

      function toggleVisibility() {
        scope.isVisible = !scope.isVisible;
      }

      function test() {
        alert('Test');
      }

      scope.toggleVisibility = toggleVisibility;
      scope.test = test;
      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };    

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: template
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
