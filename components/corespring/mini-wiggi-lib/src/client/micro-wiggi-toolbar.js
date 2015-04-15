var main = [
  'ToolbarDef',
  function(ToolbarDef) {
    return new ToolbarDef({
      container: 'microWiggi'
    });
  }
];

exports.framework = 'angular';
exports.directive = {
  name: "microWiggiToolbar",
  directive: main
};