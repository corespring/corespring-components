exports.framework = 'angular';
exports.directives = [
  {
    directive: [
      'EditingAudioService',
      ConfigAudioPlayerDirective
    ]
  }
];

function ConfigAudioPlayerDirective(EditingAudioService) {

  return {
    link: link,
    replace: true,
    restrict: 'AE',
    scope: {},
    template: template()
  };

  function link(scope, element, attrs) {

    var AUDIO_FORMATS = [
      {
        mime: 'audio/mp3',
        suffix: 'mp3'
      }
    ];

    var UI = {
      LOUDSPEAKER: 'loudspeaker',
      FULL_CONTROLS: 'fullControls',
      PLAY_PAUSE: 'playPause'
    };

    var debouncedUpdatePrelisten = _.debounce(updatePrelisten, 300);

    scope.data = {};
    scope.error = '';
    scope.fileName = '';
    scope.imageService = EditingAudioService;
    scope.percentProgress = 0;
    scope.status = 'initial';
    scope.UI = UI;

    scope.addSrc = addSrc;
    scope.removeSrc = removeSrc;

    scope.containerBridge = {
      getModel: getModel,
      setModel: setModel
    };

    scope.$watch('fullModel', watchFullModel, true);
    scope.$watch('fileName', watchFileName);
    scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

    //--------------------------------------------
    // only functions below
    //--------------------------------------------

    function getModel() {
      return _.cloneDeep(scope.fullModel);
    }

    function setModel(fullModel) {
      scope.fullModel = addDefaults(fullModel);
    }

    function addDefaults(fullModel) {
      return _.defaults(fullModel, {
        fileName: '',
        formats: {},
        pauseButtonLabel: 'Stop',
        playButtonLabel: 'Listen',
        ui: UI.PLAY_PAUSE
      });
    }

    function removeSrc(src) {
      var suffix = getSuffix(src);
      var audioFormat = _.find(AUDIO_FORMATS, function(format) {
        return format.suffix === suffix;
      });
      if (audioFormat) {
        delete scope.fullModel.formats[audioFormat.mime];
      } else {
        console.error('Unexpected audio format: ' + src);
      }
    }

    function addSrc(src) {
      var suffix = getSuffix(src);
      var audioFormat = _.find(AUDIO_FORMATS, function(format) {
        return format.suffix === suffix;
      });
      if (audioFormat) {
        scope.fullModel.formats[audioFormat.mime] = src;
      } else {
        console.error('Unexpected audio format: ' + src);
      }
    }

    function getSuffix(src) {
      return ('' + src).split('.').pop();
    }

    function watchFileName(newValue, oldValue) {
      if (oldValue) {
        if (scope.data.imageUrl) {
          EditingAudioService.deleteFile(scope.data.imageUrl);
        }
      }
      if (newValue) {
        if (scope.data.imageUrl) {
          scope.fullModel.fileName = newValue;
          addSrc(scope.data.imageUrl);
        }
      }
    }

    function watchFullModel() {
      debouncedUpdatePrelisten();
    }

    function updatePrelisten() {
      var prelisten = element.find('#prelisten');
      var containerBridge = prelisten.scope().$$childHead.containerBridge;
      containerBridge.setDataAndSession({
        data: getModel(),
        session: {}
      });
    }
  }

  function template() {
    return [
      '<div class="corespring-audio-config" ng-class="fullModel.ui">',
      '  <p>Upload a .mp3 audio file (maximum size is {{imageService.maxSizeKb}}kb).</p>',
      '  <button ng-show="status == \'initial\' || status == \'failed\'"',
      '     class="btn btn-primary upload-button"',
      '     file-chooser="">',
      '     <span class="upload-icon"><i class="fa fa-upload"></i></span> Upload Audio File',
      '  </button>',
      '  <div class="prelisten-container" ng-show="fullModel.fileName">',
      '    <div class="filename-label">',
      '      Uploaded File: <label>{{fullModel.fileName}}</label>',
      '    </div>',
      '    <div id="prelisten" corespring-audio=""/>',
      '  </div>',
      '  <div class="alert alert-danger wiggi-wiz-alert ng-hide"',
      '      ng-show="error"',
      '      ng-bind="error"></div>',
      '  <div class="alert alert-success wiggi-wiz-alert ng-hide"',
      '      ng-show="fileName"><strong>Upload successful.</strong><br/>You have successfully uploaded: {{fileName}}',
      '  </div>',
      '  <div ng-if="status == \'started\'">',
      '    <div class="uploading-label">Uploading audio file {{percentProgress}}%</div>',
      '    <progressbar value="percentProgress"',
      '        class="progress-striped"></progressbar>',
      '  </div>',
      '  <div class="select-ui">',
      '    <p>Select ui</p>',
      '      <radio ng-model="fullModel.ui" value="{{UI.FULL_CONTROLS}}" class="control-label">Show browser controls</radio>',
      '      <radio ng-model="fullModel.ui" value="{{UI.LOUDSPEAKER}}" class="control-label">Show loudspeaker icon button</radio>',
      '      <radio ng-model="fullModel.ui" value="{{UI.PLAY_PAUSE}}" class="control-label">Show configurable play/pause buttons</radio>',
      '      <div class="play-pause-labels-form" ng-show="fullModel.ui == UI.PLAY_PAUSE">',
      '        <label>Play Button Label:',
      '          <input type="text" class="form-control" ng-model="fullModel.playButtonLabel"/>',
      '        </label>',
      '        <label>Pause Button Label',
      '          <input type="text" class="form-control" ng-model="fullModel.pauseButtonLabel"/>',
      '        </label>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }
}