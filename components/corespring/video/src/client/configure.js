var main = [
  '$log',
  '$sce',
  'VideoUtils',
  function($log, $sce, VideoUtils) {

    "use strict";

    var previewVideo = [
      '  <div>Preview</div>',
      '  <iframe ng-if="fullModel.model.config.url" class="preview-player" width="180" height="100"',
      '          ng-src="{{trustSource(previewUrl)}}"',
      '          frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>',
      '  <div ng-if="!fullModel.model.config.url" class="blank-video">Video URL not provided<br><i class="fa fa-link"></i></div>'
    ].join('\n');

    var designPanel = [
      '<div navigator-panel="Design">',
      '  <div class="input-holder">',
      '    <div class="body">',
      '      <div class="description">',
      '        <div>Add a video by providing the video URL and description below. Videos hosted by <i class="video-icon fa fa-youtube" /> YouTube and <i class="fa fa-vimeo-square video-icon" /> Vimeo are currently supported.</div>',
      '      </div>',
      '      <div class="split-container">',
      '        <form class="split-left" role="form">',
      '          <div class="cs-video-row clearfix">',
      '            <span class="col-md-2">',
      '              Video URL:',
      '            </span>',
      '            <span class="col-md-9">',
      '              <input type="text" class="form-control" ng-model="fullModel.model.config.url" />',
      '            </span>',
      '          </div>',
      '          <div class="cs-video-row clearfix">',
      '            <span class="col-md-2" />',
      '            <span class="col-md-10">',
      '              <div>Examples</div>',
      '              <div><i class="video-icon fa fa-youtube" />https://www.youtube.com/watch?v=k1i9YmUgY0Q</div>',
      '              <div><i class="video-icon fa fa-vimeo-square" />http://vimeo.com/84687115</div>',
      '            </span>',
      '          </div>',
      '          <div class="cs-video-row clearfix">',
      '            <span class="col-md-2">',
      '              Description:',
      '            </span>',
      '          </div>',
      '          <div class="cs-video-row clearfix">',
      '            <span class="col-md-11">',
      '              <textarea class="form-control" ng-model="fullModel.model.config.description" />',
      '            </span>',
      '          </div>',
      '        </form>',
      '        <div class="split-right">',
        '          ' + previewVideo,
      '          <br>',
      '          <div>Video Size:</div>',
      '          <input type="number" class="form-control" style="max-width: 80px; display: inline-block" ng-blur="setConstraints()" ng-model="fullModel.model.config.width"/> x ',
      '          <input type="number" class="form-control" style="max-width: 80px; display: inline-block" ng-blur="setConstraints()" ng-model="fullModel.model.config.height" />',
      '          px',
      '          <button ng-click="resetDimensions()" class="btn btn-sm btn-default">Reset</button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    var panels = [
      '<div class="cs-video-config">',
      '  <div navigator="">',
      designPanel,
      '  </div>',
      '</div>'
    ].join("\n");

    return {
      scope: 'isolate',
      restrict: 'E',
      replace: true,
      template: panels,
      link: function(scope, element, attrs) {
        scope.containerBridge = {
          setModel: function(fullModel) {
            scope.fullModel = fullModel;
          }
        };

        scope.$emit('registerConfigPanel', attrs.id, scope.containerBridge);

        scope.trustSource = function(source) {
          return $sce.trustAsResourceUrl(source);
        };

        scope.resetDimensions = function() {
          scope.fullModel.model.config.width = 480;
          scope.fullModel.model.config.height = 270;
        };

        scope.setConstraints = function() {
          var w = scope.fullModel.model.config.width;
          scope.fullModel.model.config.width = Math.min(Math.max(w, 177), 500);
          var h = scope.fullModel.model.config.height;
          scope.fullModel.model.config.height = Math.min(Math.max(h, 100), 281);
        };

        var updatePreview = function(n) {
          if (_.isEmpty(n)) {
            scope.previewUrl = "";
          } else {
            scope.previewUrl = VideoUtils.convertYoutubeOrVimeoUrlToEmbedded(scope.fullModel.model.config.url);
          }
        };

        scope.$watch('fullModel.model.config.url', _.debounce(updatePreview, 500));

        scope.$watch('fullModel.model.config.height', function(n) {
          if (n) {
            var w = n / 9 * 16;
            if (Math.abs(w - scope.fullModel.model.config.width) > 10) {
              scope.fullModel.model.config.width = Math.floor(w);
            }
          }
        });

        scope.$watch('fullModel.model.config.width', function(n) {
          if (n) {
            var h = n / 16 * 9;
            if (Math.abs(h - scope.fullModel.model.config.height) > 10) {
              scope.fullModel.model.config.height = Math.floor(h);
            }
          }
        });
      }
    };
  }
];


exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];
