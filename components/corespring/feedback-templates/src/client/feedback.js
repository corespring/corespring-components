exports.framework = "angular";
exports.directive = {
  name: "feedback",
  directive: ['$log', FeedbackDirective]
};


function FeedbackDirective($log) {

  return {
    link: link,
    replace: true,
    scope: {
      "feedback": "=",
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

    function getIconSet(iconSet){
      if(_.isEmpty(iconSet)){
        return 'emoji';
      }
      return iconSet;
    }

    function getIconShape(iconKey){
      if(iconKey === 'nothing-submitted'){
        return '';
      }
      return 'square';
    }

    function getIconKey(correctClass){
      if( correctClass === 'partial') {
        return 'partially-correct';
      }
      if(correctClass.indexOf('answer-expected') >= 0 || correctClass.indexOf('warning') >= 0){
        return 'nothing-submitted';
      }
      return correctClass;
    }
  }

  function template() {
    return [
      '<div class="panel panel-default feedback {{correctClass}}" ng-if="feedback">',
      '  <div>',
      '    <div class="panel-body">',
      '      <svg-icon key="{{iconKey}}" shape="{{iconShape}}" icon-set="{{iconSet}}"></svg-icon>',
      '      <div ng-bind-html-unsafe="feedback">',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }
}