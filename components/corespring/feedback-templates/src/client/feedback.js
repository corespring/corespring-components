exports.framework = "angular";
exports.directive = {
  name: "feedback",
  directive: ['$log', FeedbackDirective]
};


function FeedbackDirective($log) {

  return {
    replace: true,
    scope: {
      "feedback": "=",
      "iconSet": "@",
      "correctClass": "@"
    },
    template: template()
  };

  function template() {
    return [
      '<div class="panel panel-default feedback {{correctClass}}" ng-if="feedback">',
      '  <div>',
      '    <div class="panel-body">',
      '      <feedback-icon-for-feedback-templates icon-set="{{iconSet}}" correct-class="{{correctClass}}"></feedback-icon-for-feedback-templates>',
      '      <div ng-bind-html-unsafe="feedback">',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }
}