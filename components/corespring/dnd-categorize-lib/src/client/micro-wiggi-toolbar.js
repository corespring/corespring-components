angular.module('corespring.wiggi-wiz').directive('microWiggiToolbar', [
  'ToolbarDef',
  function(ToolbarDef) {
    return new ToolbarDef({
      container: 'microWiggiWiz'
    });
  }
]);