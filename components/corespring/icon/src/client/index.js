var main = [function() {
  return {
    restrict: 'E',
    scope : {
      'key': '@'
    },
    template: [
      '<span class="{{key}}">',
      '  <span popover="{{text}}" popover-position="top" popover-trigger="{{text ? \'mouseover\' : \'\'}}">',
      '    <div style="width: 30px;" class="cs-icon">',
      '      <ng-include src="template"/>',
      '    </div>',
      '  </span>',
      '</span>'
    ].join('\n'),
    link: function($scope, $element, $attrs) {
      var iconSet = 'emoji';
      $scope.text = $attrs.text;
      $scope.key = $attrs.key + ($scope.text ? '-feedback' : '');
      $scope.template = '../../../images/feedback/' + [iconSet, $scope.key].join('-') + ($attrs.shape ? '-' + $attrs.shape : '') + '.svg';
      console.log('$scope.template', $scope.template);
    }
  }
}];

exports.framework = 'angular';
exports.directives = [{
  name: 'icon',
  directive: main
}];