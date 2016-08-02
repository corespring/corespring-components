exports.framework = 'angular';
exports.directives = [
  {
    directive: ['$sce', 'AudioTagController', RenderAudioPlayerDirective]
  }
];


function RenderAudioPlayerDirective($sce, AudioTagController) {

  return {
    link: link,
    replace: true,
    restrict: 'AE',
    scope: {},
    template: template()
  };

  function link(scope, element, attrs) {

    var UI = scope.UI = {
      FULL_CONTROLS: 'fullControls',
      PLAY_PAUSE: 'playPause',
      SPEAKER: 'speaker'
    };

    var PLAYER_STATUS = scope.PLAYER_STATUS = {
      PAUSED: 'paused',
      PLAYING: 'playing'
    };

    var audioElement = new AudioTagController(element, 'audio')
      .onLoaded(enablePlayButton).onEnded(resetStatus);

    scope.playButtonDisabled = true;

    scope.play = play;
    scope.stop = stop;

    var unusedFunctions = [
      'answerChangedHandler',
      'editable',
      'reset',
      'setInstructorData',
      'setMode',
      'setResponse',
      'setPlayerSkin'
    ];

    scope.containerBridge = addEmptyFunctions(
      unusedFunctions, {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        isAnswerEmpty: isAnswerEmpty
      });

    scope.$on('$destroy', onDestroy);
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
        fileName: '',
        pauseButtonLabel: 'Stop',
        playButtonLabel: 'Listen',
        ui: UI.FULL_CONTROLS
      }, dataAndSession.data);
      return config;
    }

    function prepareSources() {
      var sources = [];

      if(scope.config.fileName){
        sources.push({ type:'audio/mp3', src: $sce.trustAsResourceUrl(scope.config.fileName)});
      }

      return sources;
    }

    function getSession() {
      return {
        answers: ''
      };
    }

    function isAnswerEmpty() {
      return false;
    }

    function updateAudioElement() {
      scope.playButtonDisabled = true;
      scope.playerStatus = PLAYER_STATUS.PAUSED;
      audioElement.update(scope.config.ui === UI.FULL_CONTROLS);
    }

    function enablePlayButton() {
      scope.playButtonDisabled = false;
    }

    function addEmptyFunctions(fns, obj) {
      _.each(fns, function(fn) {
        obj[fn] = function() {};
      });
      return obj;
    }

    function play() {
      audioElement.play();
      scope.playerStatus = PLAYER_STATUS.PLAYING;
    }

    function resetStatus() {
      scope.playerStatus = PLAYER_STATUS.PAUSED;
    }

    function stop() {
      audioElement.pause();
      audioElement.reset();
      scope.playerStatus = PLAYER_STATUS.PAUSED;
    }

    function onDestroy() {
      audioElement.destroy();
    }

  }

  function template() {
    return [
      '<div class="corespring-audio-render"',
      '    ng-class="config.ui">',
      '  <div ng-if="config.ui == UI.SPEAKER">',
      '    <button class="btn speaker-button play"',
      '        ng-disabled="playButtonDisabled"',
      '        ng-click="play()"',
      '        ng-hide="playerStatus == PLAYER_STATUS.PLAYING"><i class="fa fa-volume-up"></i></button>',
      '    <button class="btn speaker-button stop"',
      '        ng-click="stop()"',
      '        ng-show="playerStatus == PLAYER_STATUS.PLAYING"><i class="fa fa-volume-up"></i></button>',
      '  </div>',
      '  <div ng-if="config.ui == UI.PLAY_PAUSE">',
      '    <button class="btn"',
      '        ng-disabled="playButtonDisabled"',
      '        ng-click="play()"',
      '        ng-hide="playerStatus == PLAYER_STATUS.PLAYING">{{config.playButtonLabel}}',
      '    </button>',
      '    <button class="btn"',
      '        ng-click="stop()"',
      '        ng-show="playerStatus == PLAYER_STATUS.PLAYING">{{config.pauseButtonLabel}}',
      '    </button>',
      '  </div>',
      '  <audio>',
      '    <source ng-repeat="src in sources"',
      '        src="{{src.src}}"',
      '        type="{{src.type}}"/>',
      '    Your browser does not support the audio element.',
      '  </audio>',
      '</div>'
    ].join('');
  }
}