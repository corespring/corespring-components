exports.framework = 'angular';
exports.directives = [
  {
    directive: ['$sce', RenderAudioPlayerDirective]
  }
];

function RenderAudioPlayerDirective($sce) {

  return {
    link: link,
    replace: true,
    restrict: 'AE',
    scope: {},
    template: template()
  };

  function link(scope, element, attrs) {

    scope.pause = pause;
    scope.play = play;

    var unusedFunctions = [
      'answerChangedHandler',
      'editable',
      'reset',
      'setMode',
      'setResponse'
    ];

    scope.containerBridge = addEmptyFunctions(
      unusedFunctions, {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        isAnswerEmpty: isAnswerEmpty
      });

    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

    //--------------------------------------------------
    // only functions below
    //--------------------------------------------------

    function setDataAndSession(dataAndSession) {
      scope.config = getConfig(dataAndSession);
      scope.sources = prepareSources();

      updateAudioElement();
    }

    function getConfig(dataAndSession) {
      var config = _.assign({
        showControls: "playPause",
        playButtonLabel: "Listen",
        pauseButtonLabel: "Stop",
        formats: {}
      }, dataAndSession.data);
      return config;
    }

    function prepareSources() {
      return _.map(scope.config.formats, function(src, type) {
        var newSrc = {
          type: type,
          url: src,
          trustedUrl: trustUrl(src)
        };
        return newSrc;
      });
    }

    function getSession() {
      return {
        answers: ""
      };
    }

    function isAnswerEmpty() {
      return false;
    }

    function updateAudioElement() {
      console.log("updateAudioElement", scope.config);
      var audioElement = element.find('audio');
      audioElement.attr('controls', scope.config.showControls === 'fullControls');
      audioElement.load();
    }

    function trustUrl(url) {
      return $sce.trustAsResourceUrl(url);
    }

    function addEmptyFunctions(fns, obj) {
      _.each(fns, function(fn) {
        obj[fn] = function() {};
      });
      return obj;
    }

    function play(){
      var audioElement = element.find('audio');
      console.log(audioElement);
      audioElement.off('ended', resetStatus);
      audioElement.on('ended', resetStatus);
      audioElement[0].play();
      scope.status = 'playing';
    }

    function resetStatus(){
      scope.status = 'paused';
    }

    function pause(){
      var audioElement = element.find('audio');
      audioElement[0].pause();
      audioElement[0].currentTime = 0;
      scope.status = 'paused';
    }

  }

  function template() {
    return [
      '<div class="corespring-audio-view">',
      '  <div ng-if="config.showControls == \'playPause\'">',
      '    <button ng-click="play()" ng-hide="status == \'playing\'">{{config.playButtonLabel}}</button>',
      '    <button ng-click="pause()" ng-show="status == \'playing\'">{{config.pauseButtonLabel}}</button>',
      '  </div>',
      '  <audio>',
      '    <source ng-repeat="src in sources" ng-src="{{src.trustedUrl}}" type="{{src.type}}">',
      '    Your browser does not support the audio element.',
      '  </audio>',
      '</div>'
    ].join('');
  }
}