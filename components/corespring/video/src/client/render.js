var main = [
  '$sce',
  'VideoUtils',
  function($sce, VideoUtils) {

    var link = function() {
      return function(scope, element, attrs) {

        var addEmptyFunctions = function(obj, fns) {
          _.each(fns, function(fn) {
            obj[fn] = function() {};
          });
        };

        scope.containerBridge = {
          setDataAndSession: function(dataAndSession) {
            scope.question = dataAndSession.data.model;
            scope.session = dataAndSession.session || {};
            scope.answer = scope.session.answers;
            scope.url = _.isEmpty(scope.question.config.url) ? "" : VideoUtils.convertYoutubeUrlToEmbedded(scope.question.config.url) + "?controls=0&rel=0&showinfo=0";
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

        addEmptyFunctions(scope.containerBridge, ['setResponse','setMode','reset','answerChangedHandler','editable']);

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
        '      <iframe id="ytplayer" width="480" height="270"',
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
