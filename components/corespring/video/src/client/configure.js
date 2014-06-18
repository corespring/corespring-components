var main = [
  '$log',
  '$sce',
  function($log, $sce) {

    "use strict";

    var previewVideo = [
      '<div class="preview-video">',
      '  <div>Preview</div>',
      '  <iframe id="ytplayer" width="180" height="100"',
      '          ng-src="{{trustSource(previewUrl)}}"',
      '          frameborder="0" allowfullscreen>',
      '</div>'
    ].join('\n');

    var designPanel = [
      '<div navigator-panel="Design">',
      '  <div class="input-holder">',
      '    <div class="body">',
      '      <form role="form">',
      '        <div class="cs-video-row clearfix" >',
      '          <span class="col-md-1">',
      '            Type:',
      '          </span>',
      '          <span class="col-md-5">',
      '            <input type="radio" id="ytradio" ng-model="fullModel.model.config.type" value="youtube" />',
      '            <label for="ytradio">Youtube</label>',
      '            <input disabled type="radio" id="vmradio" ng-model="fullModel.model.config.type" value="vimeo" />',
      '            <label for="vmradio">Vimeo</label>',
      '            <input disabled type="radio" id="upradio" ng-model="fullModel.model.config.type" value="upload" />',
      '            <label for="upradio">Upload</label>',
      '          </span>',
      '        </div>',
      '        <div class="cs-video-row clearfix">',
      '          <span class="col-md-2">',
      '            Url:',
      '          </span>',
      '          <span class="col-md-5">',
      '            <input type="text" class="form-control" ng-model="fullModel.model.config.url" />',
      '          </span>',
      '        </div>',
      '        <div class="cs-video-row clearfix">',
      '          <span class="col-md-2">',
      '            Description:',
      '          </span>',
      '          <span class="col-md-5">',
      '            <input type="text" class="form-control" ng-model="fullModel.model.config.description" />',
      '          </span>',
      '        </div>',
      '        <div class="cs-video-row clearfix">',
      '          <span class="col-md-2">',
      '            Copyright Owner:',
      '          </span>',
      '          <span class="col-md-5">',
      '            <input type="text" class="form-control" ng-model="fullModel.model.config.copyrightOwner" />',
      '          </span>',
      '        </div>',
      '        <div class="cs-video-row clearfix">',
      '          <span class="col-md-2">',
      '            Copyright Year:',
      '          </span>',
      '          <span class="col-md-5">',
      '            <input type="text" class="form-control" ng-model="fullModel.model.config.copyrightYear" />',
      '          </span>',
      '        </div>',
      '        <div ng-show="fullModel.model.config.url">' + previewVideo + '</div>',
      '      </form>',
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

        scope.$watch('fullModel.model.config.url', function(n) {
          if (_.isEmpty(n)) {
            scope.previewUrl = "";
          } else {
            if (scope.fullModel.model.config.type === 'youtube') {
              scope.previewUrl = scope.fullModel.model.config.url + "?controls=0&rel=0&showinfo=0";
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
