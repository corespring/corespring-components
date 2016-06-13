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

    scope.containerBridge = addEmptyFunctions({
      setDataAndSession: setDataAndSession,
      getSession: getSession,
      isAnswerEmpty: isAnswerEmpty
    }, [
      'answerChangedHandler',
      'editable',
      'reset',
      'setMode',
      'setResponse',
    ]);

    scope.$emit('registerComponent', attrs.id, scope.containerBridge);

    //--------------------------------------------------
    // only functions below
    //--------------------------------------------------

    function setDataAndSession(dataAndSession) {
      scope.config = getConfig(dataAndSession);
      scope.sources = prepareSources();

      initAudioElement();
    }

    function getConfig(dataAndSession) {
      var config = _.assign({
        showControls: true,
        sources: []
      }, dataAndSession && dataAndSession.data && dataAndSession.data.model ? dataAndSession.data.model.config : {});
      return config;
    }

    function prepareSources() {
      return _.map(scope.config.sources, function(src) {
        var newSrc = _.cloneDeep(src);
        newSrc.trustedUrl = trustUrl(newSrc.url);
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

    function initAudioElement() {
      console.log("initAudioElement", scope.config);
      var audioElement = element.find('audio');
      audioElement.attr('controls', scope.config.showControls);
      audioElement.load();
    }

    function trustUrl(url) {
      return $sce.trustAsResourceUrl(url);
    }

    function addEmptyFunctions(obj, fns) {
      _.each(fns, function(fn) {
        obj[fn] = function() {};
      });
      return obj;
    }

  }

  function template() {
    return [
      '<div class="view-audio-player">',
      '  <audio>',
      '    <source ng-repeat="src in sources" ng-src="{{src.trustedUrl}}" type="{{src.type}}">',
      '    Your browser does not support the audio element.',
      '  </audio>',
      '</div>',
    ].join('');
  }
}