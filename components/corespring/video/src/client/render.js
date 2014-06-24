var main = [
  '$sce',
  'VideoUtils',
  function($sce, VideoUtils) {

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
            scope.width = Math.min(scope.question.config.width || 480, 500) + "px";
            scope.height = Math.min(scope.question.config.height || 270, 500) + "px";
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
        '      <iframe id="ytplayer" width="{{width}}" height="{{height}}"',
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
