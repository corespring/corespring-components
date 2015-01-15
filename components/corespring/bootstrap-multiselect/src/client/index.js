/* global exports, console */

var directive = function() {
  "use strict";

  return function(scope, element, attrs) {

    if(element && element.multiselect) {

      element.multiselect();

      var btn = element.next().find('button');
      btn.dropdown();

      scope.$watch(function () {
        return element[0].length;
      }, function () {
        element.multiselect('rebuild');
      });

      scope.$watch(attrs.ngModel, function () {
        element.multiselect('refresh');
      });

      if (attrs.ngOptions && _.isString(attrs.ngOptions)) {
        var model = attrs.ngOptions.split("in ")[1];
        scope.$watch(model, function (n) {
          element.multiselect('rebuild');
        }, true);
      }
    } else {
      console.warn("warning: element.multiselect is not defined");
    }
  };
};


exports.framework = 'angular';
exports.directive = {
    name: 'bootstrapMultiselect',
    directive: directive
};

