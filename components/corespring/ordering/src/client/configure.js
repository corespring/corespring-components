var main = [
  function() {
    return {
      scope: {},
      restrict: 'AE',
      link: function() {
      },
      template: [
        '<div></div>'
      ].join('\n')
    };
  }
];


exports.framework = 'angular';
exports.directives = [{
    directive: main
}];
