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

    var UI = {
      PLAY_PAUSE: 'playPause',
      FULL_CONTROLS: 'fullControls'
    };

    var PLAYER_STATUS = {
      PLAYING: 'playing',
      PAUSED: 'paused'
    };

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
        ui: UI.PLAY_PAUSE,
        playButtonLabel: 'Listen',
        pauseButtonLabel: 'Stop',
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
        answers: ''
      };
    }

    function isAnswerEmpty() {
      return false;
    }

    function getAudioElement() {
      return element.find('audio');
    }

    function updateAudioElement() {
      var audioElement = getAudioElement();
      audioElement.attr('controls', scope.config.ui === UI.FULL_CONTROLS);
      audioElement.off('loadeddata', enablePlayButton);
      audioElement.on('loadeddata', enablePlayButton);
      scope.playButtonDisabled = true;
      audioElement.load();
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
      var audioElement = getAudioElement();
      audioElement.off('ended', resetStatus);
      audioElement.on('ended', resetStatus);
      audioElement[0].play();
      scope.status = PLAYER_STATUS.PLAYING;
    }

    function resetStatus() {
      scope.status = PLAYER_STATUS.PAUSED;
    }

    function pause() {
      var audioElement = getAudioElement();
      audioElement[0].pause();
      audioElement[0].currentTime = 0;
      scope.status = PLAYER_STATUS.PAUSED;
    }

    function onDestroy() {
      var audioElement = getAudioElement();
      audioElement.off('ended', resetStatus);
      audioElement.off('loadeddata', enablePlayButton);
    }

  }

  function template() {
    return [
      '<div class="corespring-audio-view" ng-class="config.ui">',
      '  <div ng-if="config.ui == UI.PLAY_PAUSE">',
      '    <button ng-disabled="playButtonDisabled" ng-click="play()" ng-hide="status == PLAYER_STATUS.PLAYING">{{config.playButtonLabel}}</button>',
      '    <button ng-click="pause()" ng-show="status == PLAYER_STATUS.PLAYING">{{config.pauseButtonLabel}}</button>',
      '  </div>',
      '  <audio>',
      '    <source ng-repeat="src in sources" ng-src="{{src.trustedUrl}}" type="{{src.type}}">',
      '    Your browser does not support the audio element.',
      '  </audio>',
      '</div>'
    ].join('');
  }
}