exports.framework = 'angular';
exports.directives = [
  {
    directive: [
      '$sce',
      'EditingAudioService',
      ConfigAudioPlayerDirective
    ]
  }
];

function ConfigAudioPlayerDirective($sce, EditingAudioService) {

  return {
    controller: ['$scope', controller],
    link: link,
    replace: true,
    restrict: 'AE',
    scope: {},
    template: template()
  };

  function controller(scope) {
    scope.$on('registerComponent', savePrelistenContainerBridge);

    function savePrelistenContainerBridge(event, id, bridge) {
      if (id === 'prelisten') {
        //prelisten should not register with the real ComponentRegister
        //because that confuses the client side preview
        event.stopPropagation();
        scope.prelisten = bridge;
      }
    }
  }

  function link(scope, element, attrs) {

    var UI = scope.UI = {
      FULL_CONTROLS: 'fullControls',
      PLAY_PAUSE: 'playPause',
      SPEAKER: 'speaker'
    };

    var debouncedUpdatePrelisten = _.debounce(updatePrelisten, 300);

    scope.data = {};
    scope.error = null;
    scope.errorMessage = '';
    scope.fileName = '';
    scope.formattedFileName = '';
    scope.imageService = EditingAudioService;
    scope.percentProgress = 0;
    scope.status = 'initial';

    scope.formatFileName = formatFileName;
    scope.onClickRemove = onClickRemove;
    scope.onClickUpload = onClickUpload;

    scope.containerBridge = {
      getModel: getModel,
      setModel: setModel
    };

    scope.$watch('error', watchError);
    scope.$watch('fileName', watchFileName);
    scope.$watch('status', function(newValue, oldValue){
      console.log('status', newValue);
    });
    scope.$watch('fullModel', watchFullModel, true);

    scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

    //--------------------------------------------
    // only functions below
    //--------------------------------------------

    function watchError(newValue, oldValue) {
      scope.errorMessage = newValue ? $sce.getTrustedHtml(newValue) : '';
    }

    /**
     * scope.fileName is set by the fileChooser/Uploader
     * This also sets scope.data.imageUrl to the download-url
     * of the file, which might be different
     */
    function watchFileName(newValue, oldValue) {
      if (newValue) {
        if (scope.data.imageUrl) {
          scope.fullModel.fileName = scope.data.imageUrl;
        }
      }
    }

    function watchFullModel() {
      debouncedUpdatePrelisten();
      updateFormattedFileName();
    }



    function getModel() {
      return _.cloneDeep(scope.fullModel);
    }

    function setModel(fullModel) {
      scope.fullModel = addDefaults(fullModel);
    }

    function addDefaults(fullModel) {
      return _.defaults(fullModel, {
        fileName: '',
        pauseButtonLabel: 'Stop',
        playButtonLabel: 'Listen',
        ui: UI.FULL_CONTROLS
      });
    }

    function updatePrelisten() {
      scope.prelisten.setDataAndSession({
        data: getModel(),
        session: {}
      });
    }

    function updateFormattedFileName() {
      scope.formattedFileName = formatFileName(scope.fullModel.fileName || '');
    }

    function removeFile() {
      if (scope.fullModel.fileName) {
        EditingAudioService.deleteFile(scope.fullModel.fileName);
      }
      scope.fullModel.fileName = '';
    }

    function withoutUniqueId(s) {
      var parts = (s + '').split('-');
      if (parts.length > 1) {
        parts.shift();
      }
      return parts.join('-');
    }

    function decodeURIMultiple(s) {
      var decoded = decodeURI(s);
      return decoded === s ? decoded : decodeURIMultiple(decoded);
    }

    function formatFileName(s) {
      return decodeURIMultiple(withoutUniqueId(s));
    }

    function onClickUpload(){
      console.log('onClickUpload');
      scope.status = 'initial';
    }

    function onClickRemove(){
      console.log('onClickRemove');
      removeFile();
      scope.status = 'initial';
    }

  }

  function template() {
    return [
      '<div class="corespring-audio-configure"',
      '    ng-class="fullModel.ui">',
      '  <div class="alert alert-danger wiggi-wiz-alert ng-hide"',
      '      ng-show="status == \'failed\'">',
      '    <span ng-bind-html-unsafe="errorMessage"/>',
      '  </div>',
      '  <div class="alert alert-success wiggi-wiz-alert ng-hide"',
      '      ng-show="status == \'completed\'"><strong>Upload successful.</strong><br/>You have successfully uploaded: {{fileName}}',
      '  </div>',
      '  <div ng-if="status == \'started\'">',
      '    <div class="uploading-label">Uploading audio file {{percentProgress}}%</div>',
      '    <progressbar value="percentProgress"',
      '        class="progress-striped"></progressbar>',
      '  </div>',
      '  <div ng-hide="fullModel.fileName">',
      '    <p>Upload .mp3 audio file (maximum size {{imageService.maxSizeKb}}kb).</p>',
      '    <button ng-show="status == \'initial\' || status == \'failed\'"',
      '        ng-click="onClickUpload()"',
      '        class="btn btn-primary upload-button"',
      '        file-chooser="">',
      '      <span class="upload-icon"><i class="fa fa-upload"></i></span> Upload Audio File',
      '    </button>',
      '  </div>',
      '  <div ng-show="fullModel.fileName">',
      '    <button class="btn btn-primary upload-button"',
      '        ng-click="onClickRemove()">Remove Audio',
      '    </button>',
      '  </div>',
      '  <div class="prelisten-container"',
      '      ng-show="fullModel.fileName">',
      '    <div class="filename-label">',
      '      Uploaded File: <label>{{formattedFileName}}</label>',
      '    </div>',
      '    <div id="prelisten"',
      '        corespring-audio=""/>',
      '  </div>',
      '  <div class="select-ui">',
      '    <p>Audio Display Options</p>',
      '    <radio ng-model="fullModel.ui"',
      '        value="{{UI.FULL_CONTROLS}}"',
      '        class="control-label">Full Control Panel',
      '    </radio>',
      '    <radio ng-model="fullModel.ui"',
      '        value="{{UI.SPEAKER}}"',
      '        class="control-label">Speaker Icon',
      '    </radio>',
      '    <radio ng-model="fullModel.ui"',
      '        value="{{UI.PLAY_PAUSE}}"',
      '        class="control-label">Customized Play/Stop Button',
      '    </radio>',
      '    <div class="play-pause-labels-form"',
      '        ng-show="fullModel.ui == UI.PLAY_PAUSE">',
      '      <label>Play Button Label:',
      '        <input type="text"',
      '            class="form-control"',
      '            ng-model="fullModel.playButtonLabel"/>',
      '      </label>',
      '      <label>Pause Button Label',
      '        <input type="text"',
      '            class="form-control"',
      '            ng-model="fullModel.pauseButtonLabel"/>',
      '      </label>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }
}