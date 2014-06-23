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
      '        <div>Add a video by providing the video URL and description below. Videos hosted by the following providers are currently supported:</div>',
      '        <div><i class="video-icon fa fa-youtube" /><i class="fa fa-vimeo-square" /></div>',
      '      </div>',
      '      <div class="split-container">',
      '        <form class="split-left" role="form">',
      '          <div class="cs-video-row clearfix" >',
      '            <span class="col-md-2">',
      '              Type:',
      '            </span>',
      '            <span class="col-md-5">',
      '              <input type="radio" id="ytradio" ng-model="fullModel.model.config.type" value="youtube" />',
      '              <label for="ytradio">Youtube or Vimeo</label>',
      '            </span>',
      '          </div>',
      '          <div class="cs-video-row clearfix">',
      '            <span class="col-md-2">',
      '              Video URL:',
      '            </span>',
      '            <span class="col-md-5">',
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
      '            <span class="col-md-9">',
      '              <input type="text" class="form-control" ng-model="fullModel.model.config.description" />',
      '            </span>',
      '          </div>',
      '        </form>',
      '        <div class="split-right">',
      '          '+previewVideo,
      '          <br>',
      '          <div>Video Size:</div>',
      '          <input type="number" max="500" class="form-control" style="max-width: 80px; display: inline-block" ng-model="fullModel.model.config.width"/> x ',
      '          <input type="number" max="500" class="form-control" style="max-width: 80px; display: inline-block" ng-model="fullModel.model.config.height" />',
      '          px',
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


        var updatePreview = function(n) {
          if (_.isEmpty(n)) {
            scope.previewUrl = "";
          } else {
            scope.previewUrl = VideoUtils.convertYoutubeOrVimeoUrlToEmbedded(scope.fullModel.model.config.url);
          }
        };

        scope.$watch('fullModel.model.config.url', _.debounce(updatePreview, 500));
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
