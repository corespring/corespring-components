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
      '          <div>Aspect Ratio:</div>',
      '          <div class="btn-group">',
      '            <button type="button" class="btn btn-default" ng-model="fullModel.model.config.ratioType" btn-radio="\'standard\'">Standard</button>',
      '            <button type="button" class="btn btn-default" ng-model="fullModel.model.config.ratioType" btn-radio="\'widescreen\'">Widescreen</button>',
      '          </div>',
      '          <br>',
      '          <div style="display: inline-block">',
      '          ' + previewVideo,
      '          </div>',
      '          <div style="display: inline-block; vertical-align: top">',
      '            <table class="sizing-table">',
      '              <div style="height: 15px"></div>',
      '              <tr>',
      '                <td class="video-icon-td"',
      '                    ng-class="{selected: fullModel.model.config.size == \'small\'}"',
      '                    ng-click="fullModel.model.config.size = \'small\'"><i class="fa fa fa-video-camera" />',
      '                </td>',
      '                <td>small<br>{{dimensions[fullModel.model.config.ratioType]["small"]}}',
      '                </td>',
      '              </tr>',
      '              <tr>',
      '                <td class="video-icon-td"',
      '                    ng-class="{selected: fullModel.model.config.size == \'medium\'}"',
      '                    ng-click="fullModel.model.config.size = \'medium\'"><i class="fa fa-lg fa-video-camera" />',
      '                </td>',
      '                </td>',
      '                <td>medium<br>{{dimensions[fullModel.model.config.ratioType]["medium"]}}',
      '                </td>',
      '              </tr>',
      '              <tr>',
      '                <td class="video-icon-td"',
      '                    ng-class="{selected: fullModel.model.config.size == \'large\'}"',
      '                    ng-click="fullModel.model.config.size = \'large\'"><i class="fa fa-2x fa-video-camera" />',
      '                </td>',
      '                </td>',
      '                <td>large<br>{{dimensions[fullModel.model.config.ratioType]["large"]}}',
      '                </td>',
      '              </tr>',
      '            </table>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join("\n");

    var panels = [
      '<div class="cs-video-config">',
        designPanel,
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

        scope.dimensions = {
          "standard": {
            "small": "240x180",
            "medium": "320x240",
            "large": "480x360"
          },
          "widescreen": {
            "small": "240x135",
            "medium": "320x180",
            "large": "480x270"
          }
        };

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
