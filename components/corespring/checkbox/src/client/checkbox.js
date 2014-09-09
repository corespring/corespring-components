/*
 * Creates a checkbox-like element which can be styled using CSS directly (unlike native <input type='checkbox'/>, which
 * can only be reliably styled for ie10+). Most of this code is based on Angular v1.2.12's handling of
 * <input type='checkbox'/>
 *
 * https://github.com/angular/angular.js/blob/5cc5cc13b9beb996e0173e97db5c0e04d0204dfb/src/ng/directive/input.js
 */
exports.framework = "angular";
exports.directive = {
  name: "checkbox",
  directive: [
    function() {

      var link = function(scope, element, attr, ctrl) {
        var trueValue = attr.ngTrueValue,
          falseValue = attr.ngFalseValue;

        if (!angular.isString(trueValue)) trueValue = true;
        if (!angular.isString(falseValue)) falseValue = false;

        element.on('click', function() {
          scope.$apply(function() {
            var newValue = !element.attr('checked');
            if (newValue === false) {
              element.removeAttr('checked');
            } else {
              element.attr('checked', true);
            }
            ctrl.$setViewValue(newValue);
            scope.checked = newValue;
          });
        });

        ctrl.$render = function() {
          element[0].checked = ctrl.$viewValue;
        };

        // Override the standard `$isEmpty` because a value of `false` means empty in a checkbox.
        ctrl.$isEmpty = function(value) {
          return value !== trueValue;
        };

        ctrl.$formatters.push(function(value) {
          return value === trueValue;
        });

        ctrl.$parsers.push(function(value) {
          return value ? trueValue : falseValue;
        });

      };

      return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
          model: '=?'
        },
        require: ['?ngModel'],
        link: function(scope, element, attr, ctrls) {
          if (ctrls[0]) {
            link(scope, element, attr, ctrls[0]);
          } else {
            console.log('no link!');
          }
        },
        template: [
          '<div class="checkbox-input">',
          '  <div class="checkbox-toggle" ng-class="{\'checked\': checked}"/><span class="label-text" ng-transclude/>',
          '</div>'
        ].join('')
      };
    }
  ]
};