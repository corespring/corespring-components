exports.framework = 'angular';

exports.directive = {
  name: 'feedbackSelector',
  directive: [
    '$log',
    'MiniWiggiScopeExtension',
    'WiggiMathJaxFeatureDef',
    FeedbackSelectorDirective]
};

function FeedbackSelectorDirective($log, MiniWiggiScopeExtension, WiggiMathJaxFeatureDef) {

  return {
    scope: {
      fbSelClass: '@',
      fbSelCustomFeedback: '=',
      fbSelDefaultFeedback: '@',
      fbSelFeedbackType: '=',
      fbSelIconSet: '@',
      fbSelHideFeedbackOptions: '@',
      fbSelLabel: '@'
    },
    controller: ['$scope', controller],
    link: link,
    replace: true,
    template: template()
  };


  function controller($scope) {
    $scope.extraFeaturesForFeedback = {
      definitions: [new WiggiMathJaxFeatureDef()]
    };

    $scope.$watch('fbSelHideFeedbackOptions', function(n) {
      if (n) {
        updateFeedbackOptionsVisibility(n);
      }
    });

    function updateFeedbackOptionsVisibility(hiddenOptions) {
      var opts = hiddenOptions.split(',');
      $scope.hidden = {};
      _(['default', 'none', 'custom']).each(function(t) {
        $scope.hidden[t] = opts.indexOf(t) >= 0;
      });
    }

  }

  function link($scope, $element, $attrs) {
    new MiniWiggiScopeExtension().postLink($scope, $element, $attrs);
  }

  function template() {

    function radioButton(value, body, attrs, labelAttrs) {
      return [
        '<label class="radio-inline" ' + labelAttrs + '>',
        '  <radio type="radio" value="' + value + '" ' + attrs + '>' + body + '</radio>',
        '</label>'
      ].join('');
    }

    return [
      '<div class="feedback-selector-view">',
      '  <div><label ng-bind-html-unsafe="fbSelLabel"></label></div>',
      '  <div>',
      radioButton("default", "Simple Feedback", "ng-model='$parent.fbSelFeedbackType'", "ng-if=\"!hidden['default']\""),
      radioButton("none", "No Feedback", "ng-model='$parent.fbSelFeedbackType'", "ng-if=\"!hidden['none']\""),
      radioButton("custom", "Customized Feedback", "ng-model='$parent.fbSelFeedbackType'", "ng-if=\"!hidden['custom']\""),
      '  </div>',
      '  <div class="clearfix"></div>',
      '  <div class="panel panel-default feedback"',
      '      ng-class="fbSelClass"',
      '      ng-show="fbSelFeedbackType != \'none\'">',
      '    <div class="panel-body">',
      '      <feedback-icon-for-feedback-templates icon-set="{{fbSelIconSet}}" correct-class="{{fbSelClass}}"></feedback-icon-for-feedback-templates>',
      '      <div ng-show="fbSelFeedbackType == \'custom\'"',
      '          class="feedback-preview custom"',
      '          features="extraFeatures"',
      '          features="extraFeaturesForFeedback"',
      '          mini-wiggi-wiz=""',
      '          ng-model="fbSelCustomFeedback"',
      '          parent-selector=".modal-body"',
      '          placeholder="Enter customized feedback to be presented to the student">',
      '      </div>',
      '      <div ng-show="fbSelFeedbackType == \'default\'"',
      '          ng-bind-html-unsafe="fbSelDefaultFeedback"',
      '          class="default-feedback"',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }
}