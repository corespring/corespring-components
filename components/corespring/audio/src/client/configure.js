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
      MP3: "audio/mp3",
      OGG: "audio/ogg"
    };

    scope.showUploadDialog = showUploadDialog;
    scope.removeSrc = removeSrc;

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
      scope.fullModel = fullModel;
    }

    function removeSrc(src) {
      var suffix = getSuffix(src);
      console.log("removeSrc", src, suffix, scope.fullModel.formats);
      if (suffix === 'mp3') {
        delete scope.fullModel.formats[AUDIO_FORMATS.MP3];
      } else if (suffix === 'ogg') {
        delete scope.fullModel.formats[AUDIO_FORMATS.OGG];
      }
    }

    function getSuffix(src) {
      return ('' + src).split('.').pop();
    }

    function addSrc(src) {
      var suffix = getSuffix(src);
      if (suffix === 'mp3') {
        scope.fullModel.formats[AUDIO_FORMATS.MP3] = src;
      } else if (suffix === 'ogg') {
        scope.fullModel.formats[AUDIO_FORMATS.OGG] = src;
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
        imageUrl: null //TODO Can we use a different name here, eg. just url maybe?
      };

      var scopeExtension = {
        editable: $('<div>'), //TODO Fix the cancel button in wiggi, this is a tmp fix only
        imageService: EditingAudioService
      };

      function onUpdate(update) {

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

      scope.$emit(
        WIGGI_EVENTS.LAUNCH_DIALOG,
        data,
        '',
        uploadAudioTemplate(),
        onUpdate,
        scopeExtension, {
          omitHeader: true,
          omitFooter: true
        }
      );
    };

  }

  function template() {
    return [
      '<div class="config-corespring-audio">',
      '  <p>Upload/remove your audio files below</p>',
      '  <ul>',
      '    <li ng-repeat="src in fullModel.formats"><a ng-click="removeSrc(src)">(remove)</a> &nbsp; {{src}}</li>',
      '    <a ng-click="showUploadDialog()">Upload audio file</a>',
      '  </ul>',
      '  <p>Toggle controls</p>',
      '  <radio ng-model="fullModel.showControls" value="playPause" class="control-label">Show play/pause button</radio>',
      '  <radio ng-model="fullModel.showControls" value="fullControls" class="control-label">Show full controls</radio>',
      '</div>',
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