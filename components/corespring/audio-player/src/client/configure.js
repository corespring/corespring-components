exports.framework = 'angular';
exports.directives = [
  {
    directive: [ConfigAudioPlayerDirective]
  }
];

function ConfigAudioPlayerDirective() {

  return {
    scope: {},
    restrict: 'AE',
    link: link,
    template: template()
  };

  function link(scope, element, attrs) {

  }

  function template(){
    return [
      '<div class="config-audio-player">',
      '</div>',
    ].join('');
  }

}