exports.framework = 'angular';
exports.directives = [
  {
    directive: [
      'EditingAudioService',
      'WIGGI_EVENTS',
      ConfigAudioPlayerDirective
    ]
  }
];

function ConfigAudioPlayerDirective(EditingAudioService, WIGGI_EVENTS) {

  return {
    link: link,
    replace: true,
    restrict: 'AE',
    scope: {},
    template: template()
  };

  function link(scope, element, attrs) {

    var AUDIO_FORMATS = {
      MP3: {mime: "audio/mp3", suffix: 'mp3'},
      OGG: {mime: "audio/ogg", suffix: 'ogg'}
    };

    var UI = {
      PLAY_PAUSE: 'playPause',
      FULL_CONTROLS: 'fullControls'
    };

    scope.UI = UI;

    scope.addSrc = addSrc;
    scope.onCloseFileUploadDialog = onCloseFileUploadDialog;
    scope.removeSrc = removeSrc;
    scope.showUploadDialog = showUploadDialog;

    scope.containerBridge = {
      getModel: getModel,
      setModel: setModel
    };

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
      return _.defaults( fullModel, {
        ui: UI.PLAY_PAUSE,
        playButtonLabel: "Listen",
        pauseButtonLabel: "Stop",
        formats: {}
      });
    }

    function removeSrc(src) {
      var suffix = getSuffix(src);
      if (suffix === AUDIO_FORMATS.MP3.suffix) {
        delete scope.fullModel.formats[AUDIO_FORMATS.MP3.mime];
      } else if (suffix === AUDIO_FORMATS.OGG.suffix) {
        delete scope.fullModel.formats[AUDIO_FORMATS.OGG.mime];
      }
    }

    function getSuffix(src) {
      return ('' + src).split('.').pop();
    }

    function addSrc(src) {
      var suffix = getSuffix(src);
      if (suffix === AUDIO_FORMATS.MP3.suffix) {
        scope.fullModel.formats[AUDIO_FORMATS.MP3.mime] = src;
      } else if (suffix === AUDIO_FORMATS.OGG.suffix) {
        scope.fullModel.formats[AUDIO_FORMATS.OGG.mime] = src;
      }
    }

    /**
     * In case you wonder, how the imageUrl is filled with the actual file name:
     * The file-chooser angular component is defined in the wiggi repository.
     * TODO Rename the file-chooser to wiggi-file-chooser
     * The imageUrl is assigned here: https://github.com/corespring/wiggi-wiz/blob/e37a877bccc28423dc15783feebbac7d4c9b4973/src/js/directives/features/image.js#L278
     */
    function showUploadDialog() {
      var data = {
        imageUrl: null //TODO rename to url, requires a change in wiggi
      };

      var scopeExtension = {
        editable: $('<div>'), //TODO Fix the cancel button in wiggi, this is a tmp fix only
        imageService: EditingAudioService //TODO rename to fileUploadService, requires change in wiggi
      };

      scope.$emit(
        WIGGI_EVENTS.LAUNCH_DIALOG,
        data,
        '',
        uploadAudioTemplate(),
        onCloseFileUploadDialog,
        scopeExtension, {
          omitHeader: true,
          omitFooter: true
        }
      );
    }

    function onCloseFileUploadDialog(update) {
      if (update.cancelled) {
        if (update.imageUrl) {
          EditingAudioService.deleteFile(update.imageUrl);
        }
        return;
      }

      if (update.imageUrl) {
        addSrc(update.imageUrl);
      }
    }

  }

  function template() {
    return [
      '<div class="corespring-audio-config" ng-class="fullModel.ui">',
      '  <p>Upload/remove your audio files below</p>',
      '  <ul>',
      '    <li ng-repeat="src in fullModel.formats"><a ng-click="removeSrc(src)">(remove)</a> &nbsp; {{src}}</li>',
      '    <a ng-click="showUploadDialog()">Upload audio file</a>',
      '  </ul>',
      '  <p>Toggle controls</p>',
      '  <radio ng-model="fullModel.ui" value="{{UI.FULL_CONTROLS}}" class="control-label">Show full controls</radio>',
      '  <radio ng-model="fullModel.ui" value="{{UI.PLAY_PAUSE}}" class="control-label">Show play/pause button</radio>',
      '  <div class="play-pause-labels-form" ng-show="fullModel.ui == UI.PLAY_PAUSE">',
      '    <label>Play Button Label:',
      '      <input type="text" class="form-control" ng-model="fullModel.playButtonLabel"/>',
      '    </label>',
      '    <label>Pause Button Label',
      '      <input type="text" class="form-control" ng-model="fullModel.pauseButtonLabel"/>',
      '    </label>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function uploadAudioTemplate() {
    return [
      '<div class="file-upload-modal"',
      '    ng-mousedown="$event.stopPropagation()"',
      '    ng-mouseup="$event.stopPropagation()">',
      '  <div class="alert alert-danger wiggi-wiz-alert ng-hide"',
      '      ng-show="error"',
      '      ng-bind="error"></div>',
      '  <div class="alert alert-success wiggi-wiz-alert ng-hide"',
      '      ng-show="fileName"><strong>Upload successful.</strong><br/>You have successfully uploaded: {{fileName}}',
      '  </div>',
      '  <div class="center-container">',
      '    <div class="info">',
      '      <span>Upload a .mp3 or .ogg audio file (maximum size is {{EditingAudioService.maxSizeKb}}kb).</span>',
      '    </div>',
      '    <div class="button-row-top">',
      '      <button ng-show="status == \'initial\' || status == \'failed\'"',
      '          class="btn btn-primary upload-button"',
      '          ng-model="data"',
      '          file-chooser="">',
      '        <span class="upload-icon"><i class="fa fa-upload"></i></span>Upload Audio File',
      '      </button>',
      '      <button ng-show="status == \'failed\'"',
      '          class="btn btn-default"',
      '          ng-click="cancel()">Cancel',
      '      </button>',
      '    </div>',
      '    <div ng-if="status == \'started\'">',
      '      <div class="uploading-label">Uploading audio file {{percentProgress}}%</div>',
      '      <progressbar value="percentProgress"',
      '          class="progress-striped"></progressbar>',
      '    </div>',
      '    <div ng-if="status !== \'completed\' && status !== \'failed\'">',
      '      <button class="btn btn-default"',
      '          ng-click="cancel()">Cancel',
      '      </button>',
      '    </div>',
      '  </div>',
      '  <div class="center-container"',
      '      ng-if="status == \'completed\'">',
      '    <button class="btn btn-primary"',
      '        ng-click="ok()">Insert',
      '    </button>',
      '    <button class="btn btn-default"',
      '        ng-click="cancel()">Cancel',
      '    </button>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

}