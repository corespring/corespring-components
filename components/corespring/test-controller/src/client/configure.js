exports.framework = 'angular';
exports.directive = ['$sce', '$log', '$timeout', TestControllerConfigurationDirective];


function TestControllerConfigurationDirective($sce, $log, $timeout) {

  return {
    scope: {},
    restrict: 'EA',
    replace: true,
    link: link,
    template: template()
  };

  function link(scope, element, attrs) {

  }

  function template(){
    return [
      '<div class="corespring-test-controller configure">',
      '<p>Test Controller Configuration',
      '</div>'
    ].join('')
  }
}