exports.framework = "angular";
exports.directive = {
  name: 'radio',
  directive: [
    function() {
      return {
        replace: true,
        restrict: 'E',
        transclude: true,
        require: ['?ngModel'],
        link: function(scope, element, attr, ctrls) {
          if (attr.name) {
            element.attr('name', attr.name);
          }
          // do the link stuff here.
        },
        template: [
          '<div class="radio-input">',
          '  <div class="radio-toggle" ng-class="{\'checked\': checked, \'disabled\': disabled}"/>',
          '  <span class="label-text" ng-transclude/>',
          '</div>'
        ].join('')
      };
    }
  ]
};