var def = [
  '$log',
  function() {
    var inline = function(type, value, body, attrs) {
      return [
          '<label class="' + type + '-inline">',
          '  <input type="' + type + '" value="' + value + '" ' + attrs + '>' + body,
          '</label>'
      ].join('\n');
    };

    return {
      scope: {
        fbSelLabel: "@",
        fbSelClass: "@",
        fbSelDefaultFeedback: "@",
        fbSelCustomFeedback: "=",
        fbSelFeedbackType: "="
      },
      link: function($scope) {
      },
      replace: true,
      template: [
        '<div class="feedback-selector-view">',
        '<div><label ng-bind-html-unsafe="fbSelLabel"></label></div>',
        '<div>',
        inline("radio", "default", "Default Feedback", "ng-model='fbSelFeedbackType'"),
        inline("radio", "none", "No Feedback", "ng-model='fbSelFeedbackType'"),
        inline("radio", "custom", "Customized Feedback", "ng-model='fbSelFeedbackType'"),
        '</div>',
        '<div class="clearfix"></div>',
        '<span ng-switch="fbSelFeedbackType">',
        '  <input ng-switch-when="custom" class="form-control feedback-preview custom {{fbSelClass}}"  type="text" ng-model="$parent.fbSelCustomFeedback" placeholder="Enter customized feedback to be presented to the student" />',
        '  <input ng-switch-when="default" class="form-control feedback-preview {{fbSelClass}}" disabled="true" type="text" value="{{fbSelDefaultFeedback}}" />',
        '  <input ng-switch-when="none" class="form-control feedback-preview nofeedback {{fbSelClass}}" disabled="true" type="text" placeholder="No feedback will be presented to the student" />',
        '</span>',
        '</div>'
      ].join('')
    };
  }
];

exports.framework = "angular";
exports.directive = {
  name: "feedbackSelector",
  directive: def
};
