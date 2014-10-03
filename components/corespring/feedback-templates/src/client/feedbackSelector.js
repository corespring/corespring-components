exports.framework = "angular";
exports.directive = {
  name: "feedbackSelector",
  directive: [
    '$log',
    'MiniWiggiScopeExtension',
    function($log, MiniWiggiScopeExtension) {
      function inline(type, value, body, attrs, labelAttrs) {
        var input = (type === 'radio') ?
          '<radio type="' + type + '" value="' + value + '" ' + attrs + '>' + body + '</radio>' :
          '<input type="' + type + '" value="' + value + '" ' + attrs + '>' + body;
        return [
          '<label class="' + type + '-inline" ' + labelAttrs + '>',
          input,
          '</label>'
        ].join('\n');
      }

      return {
        scope: {
          fbSelLabel: "@",
          fbSelClass: "@",
          fbSelDefaultFeedback: "@",
          fbSelHideFeedbackOptions: "@",
          fbSelCustomFeedback: "=",
          fbSelFeedbackType: "="
        },
        link: function($scope, $element, $attrs) {

          $scope.$watch('fbSelHideFeedbackOptions', function(n) {
            if (n) {
              var opts = $scope.fbSelHideFeedbackOptions.split(",");
              $scope.hidden = {};
              _(["default","none","custom"]).each(function(t) {
                $scope.hidden[t] = opts.indexOf(t) >= 0;
              });
            }
          });
          new MiniWiggiScopeExtension().postLink($scope, $element, $attrs);
        },
        replace: true,
        template: [
          '<div class="feedback-selector-view">',
          '<div><label ng-bind-html-unsafe="fbSelLabel"></label></div>',
          '<div>',
          inline("radio", "default", "Default Feedback", "ng-model='$parent.fbSelFeedbackType'", "ng-if=\"!hidden['default']\""),
          inline("radio", "none", "No Feedback", "ng-model='$parent.fbSelFeedbackType'", "ng-if=\"!hidden['none']\""),
          inline("radio", "custom", "Customized Feedback", "ng-model='$parent.fbSelFeedbackType'", "ng-if=\"!hidden['custom']\""),
          '</div>',
          '<div class="clearfix"></div>',
          '<div class="panel panel-default {{fbSelClass}}" ng-show="fbSelFeedbackType == \'custom\'">',
          '  <div class="panel-heading"></div>',
          '  <div class="panel-body">',
          '    <div ',
          '        mini-wiggi-wiz=""',
          '        class="form-control feedback-preview custom"',
          '        ng-model="fbSelCustomFeedback"',
          '        image-service="imageService()"',
          '        features="extraFeatures"',
          '        placeholder="Enter customized feedback to be presented to the student"',
          '        parent-selector=".wiggi-wiz-overlay">',
          '    </div>',
          '  </div>',
          '</div>',
          '</div>'
        ].join('')
      };
    }
  ]
};
