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
          '<div class="summary-feedback-input">',
          '  <div class="panel panel-default summary-panel">',
          '    <div class="panel-heading">',
          '      <h4 class="panel-title">',
          '        <a data-toggle="collapse" href="#summary-feedback">Summary Feedback (optional)</a>',
          '      </h4>',
          '    </div>',
          '    <div class="panel-body panel-collapse collapse" id="summary-feedback">',
          '      <div mini-wiggi-wiz="" ng-model="comments" image-service="imageService()" ',
          '          features="extraFeatures" feature-overrides="overrideFeatures"',
          '          parent-selector=".wiggi-wiz-overlay"',
          '          placeholder="Use this space to provide summary feedback for this interaction"/>',
          '        <edit-pane-toolbar alignment="bottom">',
          '        </edit-pane-toolbar>',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')
      };
    }
  ]
};
