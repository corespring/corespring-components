exports.framework = "angular";
exports.directive = {
  name: "feedbackIconForFeedbackTemplates",
  directive: ['$log', FeedbackIconForFeedbackTemplatesDirective]
};

function FeedbackIconForFeedbackTemplatesDirective($log) {

  return {
    link: link,
    replace: false,
    restrict: 'AE',
    scope: {
      "iconSet": "@",
      "correctClass": "@"
    },
    template: template()
  };


  function link($scope, $element, $attrs) {
    $attrs.$observe('correctClass', update);
    update();

    //------------------------------------------------
    // only functions below
    //------------------------------------------------

    function update() {
      if (!$scope.correctClass) {
        return;
      }
      $scope.iconKey = getIconKey($scope.correctClass.trim());
      $scope.iconShape = getIconShape($scope.iconKey);
      $scope.iconSet = getIconSet($scope.iconSet);
    }

    function getIconSet(iconSet) {
      if (_.isEmpty(iconSet)) {
        return 'emoji';
      }
      return iconSet;
    }

    function getIconShape(iconKey) {
      if (iconKey === 'nothing-submitted') {
        return '';
      }
      return 'square';
    }

    function getIconKey(correctClass) {
      if (correctClass === 'partial') {
        return 'partially-correct';
      }
      if (correctClass.indexOf('answer-expected') >= 0 || correctClass.indexOf('warning') >= 0) {
        return 'nothing-submitted';
      }
      return correctClass;
    }
  }

  function template() {
    return '<svg-icon key="{{iconKey}}" shape="{{iconShape}}" icon-set="{{iconSet}}"></svg-icon>';
  }
}