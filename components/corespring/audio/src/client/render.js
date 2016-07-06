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

    var UI = {
      LOUDSPEAKER: 'loudspeaker',
      FULL_CONTROLS: 'fullControls',
      PLAY_PAUSE: 'playPause'
    };

    var PLAYER_STATUS = {
      PLAYING: 'playing',
      PAUSED: 'paused'
    };

    var audioElement = new AudioTagController(element, 'audio')
      .onLoaded(enablePlayButton).onEnded(resetStatus);

    scope.UI = UI;
    scope.PLAYER_STATUS = PLAYER_STATUS;

    scope.playButtonDisabled = true;

    scope.pause = pause;
    scope.play = play;

    var unusedFunctions = [
      'answerChangedHandler',
      'editable',
      'reset',
      'setInstructorData',
      'setMode',
      'setResponse'
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
        ui: UI.PLAY_PAUSE
      }, dataAndSession.data);
      return config;
    }

    function prepareSources() {
      var formats = {
        'audio/mp3': scope.config.fileName
      };

      return _.map(formats, function(src, type) {
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

    function trustUrl(url) {
      return $sce.trustAsResourceUrl(url);
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

    function pause() {
      audioElement.pause();
      scope.playerStatus = PLAYER_STATUS.PAUSED;
    }

    function onDestroy() {
      audioElement.destroy();
    }

  }

  function template() {
    return [
      '<div class="corespring-audio-render" ng-class="config.ui">',
      '  <div ng-if="config.ui == UI.LOUDSPEAKER">',
      '    <button class="volume-play-button" ng-disabled="playButtonDisabled" ng-click="play()" ng-hide="playerStatus == PLAYER_STATUS.PLAYING"><i class="fa fa-volume-up"></i></button>',
      '    <button class="volume-stop-button" ng-click="pause()" ng-show="playerStatus == PLAYER_STATUS.PLAYING"><i class="fa fa-volume-off"></i></button>',
      '  </div>',
      '  <div ng-if="config.ui == UI.PLAY_PAUSE">',
      '    <button ng-disabled="playButtonDisabled" ng-click="play()" ng-hide="playerStatus == PLAYER_STATUS.PLAYING">{{config.playButtonLabel}}</button>',
      '    <button ng-click="pause()" ng-show="playerStatus == PLAYER_STATUS.PLAYING">{{config.pauseButtonLabel}}</button>',
      '  </div>',
      '  <audio>',
      '    <source ng-repeat="src in sources" ng-src="{{src.trustedUrl}}" type="{{src.type}}">',
      '    Your browser does not support the audio element.',
      '  </audio>',
      '</div>'
    ].join('');
  }
}