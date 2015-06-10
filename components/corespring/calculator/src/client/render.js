/* global console,exports */
var main = ['$compile', '$log', '$modal', '$rootScope', '$timeout',
  function ($compile, $log, $modal, $rootScope, $timeout) {

    "use strict";

    var template = function() {      
      return [
        '<div class="cs-calculator" ng-switch on="model.config.type" data-drag="true" jqyoui-draggable="{animate:true}" data-jqyoui-options="draggableOptions()" >',
        '  <calculator-basic-template ng-switch-default></calculator-basic-template>',
        '  <calculator-scientific-template ng-switch-when="scientific"></calculator-scientific-template>',
        '  <calculator-graphing-template ng-switch-when="graphing"></calculator-graphing-template>',
        '</div>'
      ].join("\n");
    }

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
        },
        getSession: function() {
          return {
          };
        }
      };

      addEmptyFunctions(scope.containerBridge, ['setResponse', 'setMode', 'reset', 'answerChangedHandler', 'editable', 'isAnswerEmpty']);

      scope.draggableOptions = function() {
        return {
          containment: element.closest('.player-container')
        };
      };

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
exports.directives = [
  {
    directive: main
  }
];
