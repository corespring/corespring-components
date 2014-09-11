exports.framework = "angular";
exports.directive = {
  name: 'radio',
  directive: [
    function() {

      var ngModelLink = function(scope, element, attr, ctrl) {
        element.on('click', function() {
          if (element[0].checked) {
            scope.$apply(function() {
              ctrl.$setViewValue(attr.value);
            });
          }
        });

        scope.$watch(attrs.ngModel, function(value) {
          
        });

      };

      return {
        replace: true,
        restrict: 'E',
        transclude: true,
        require: ['?ngModel'],
        link: function(scope, element, attr, ctrls) {
          if (angular.isUndefined(attr.name)) {
            //element.attr('name', nextUid()); // need to see how angular gets this in here.
          } else {
            element.attr('name', attr.name);
          }

          if (ctrls[0]) {
            ngModelLink(scope, element, attr, ctrls[0]);
          }
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