/**
 * A local derivate of mini wiggi's toolbar that is needed to be able to derive a wiggi
 */

(function () {
  var module;

  try {
    module = angular.module('corespring.wiggi-wiz');
  }
  catch(err){
    module = angular.module('corespring.wiggi-wiz', []);
  }
  module.directive('microWiggiToolbar', [
    'ToolbarDef',
    function (ToolbarDef) {
      return new ToolbarDef({
        container: 'microWiggiWiz'
      });
    }
  ]);
})();