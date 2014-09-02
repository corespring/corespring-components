/* global WiggiLinkFeatureDef */
exports.framework = "angular";
exports.directive = {
  name: "summaryFeedbackInput",
  directive: [
    '$log',
    'MiniWiggiScopeExtension',
    function($log, MiniWiggiScopeExtension) {
      return {
        restrict: 'A',
        scope: {
          comments: "=ngModel"
        },
        replace: true,
        link: function($scope) {
          new MiniWiggiScopeExtension().postLink($scope);
        },
        template: [
          '<div>',
          '  <div ng-click="commentOn = !commentOn" class="expander"><i',
          '    class="fa fa-{{commentOn ? \'minus\' : \'plus\'}}-circle"></i>Summary Feedback (optional)',
          '  </div>',
          '  <div ng-show="commentOn">',
          '    <div mini-wiggi-wiz="" ng-model="comments"',
          '      placeholder="Use this space to provide summary level feedback for this interaction."',
          '      image-service="imageService()" features="extraFeatures"',
          '      parent-selector=".wiggi-wiz-overlay"/>',
          '  </div>',
          '</div>'
        ].join('')
      };
    }
  ]
};
