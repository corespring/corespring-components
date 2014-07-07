var main = [
  '$sce',
  'VideoUtils',
  function($sce, VideoUtils) {

    var dimensions = {
      "standard": {
        "small": [240, 180],
        "medium": [320, 240],
        "large": [480, 360]
      },
      "widescreen": {
        "small": [240, 135],
        "medium": [320, 180],
        "large": [480, 270]
      }
    };

    var link = function() {
      return function(scope, element, attrs) {

        var addEmptyFunctions = function(obj, fns) {
          _.each(fns, function(fn) {
            obj[fn] = function() {
            };
          });
        };

        scope.containerBridge = {
          setDataAndSession: function(dataAndSession) {
            scope.question = dataAndSession.data.model;
            scope.session = dataAndSession.session || {};
            scope.answer = scope.session.answers;
            if (!_.isEmpty(scope.question.config.url)) {
              scope.url = _.isEmpty(scope.question.config.url) ? "" : VideoUtils.convertYoutubeOrVimeoUrlToEmbedded(scope.question.config.url);
            }
            scope.width = dimensions[scope.question.config.ratioType][scope.question.config.size][0]+'px';
            scope.height = dimensions[scope.question.config.ratioType][scope.question.config.size][1]+'px';
          },
          getSession: function() {
            return {
              answers: ""
            };
          },
          isAnswerEmpty: function() {
            return false;
          }
        };

        addEmptyFunctions(scope.containerBridge, ['setResponse', 'setMode', 'reset', 'answerChangedHandler', 'editable']);

        scope.$emit('registerComponent', attrs.id, scope.containerBridge);

        scope.trustSource = function(source) {
          return $sce.trustAsResourceUrl(source);
        };
      };
    };

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [
        '<div class="cs-video">',
        '  <div class="video-holder">',
        '    <div class="blank-video" ng-hide="question.config.url">',
        '      <i class="fa fa-film icon"></i>',
        '    </div>',
        '    <div ng-show="question.config.url">',
        '      <iframe class="cs-video-player-frame" width="{{width}}" height="{{height}}"',
        '      ng-src="{{trustSource(url)}}"',
        '      frameborder="0" allowfullscreen>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
