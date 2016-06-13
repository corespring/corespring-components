exports.framework = 'angular';
exports.directives = [
  {
    directive: [RenderAudioPlayerDirective]
  }
];

function RenderAudioPlayerDirective() {
  
  return {
    scope: {},
    restrict: 'AE',
    link: link,
    template: template()
  };

  function link(scope, element, attrs) {
    scope.sources = [
      {url:"https://s3.amazonaws.com/corespring-audio-tests-out/outputs/guns.mp3", type:"audio/mpeg"}
    ]
  }
  
  function template(){
    return [
      '<div class="view-audio-player">',
      '  <audio controls>',
      '    <source ng-repeat="src in sources" src="{{src.url}}" type="{{src.type}}">',
      '    Your browser does not support the audio element.',
      '  </audio>',
      '</div>',
    ].join('');
  }
}
