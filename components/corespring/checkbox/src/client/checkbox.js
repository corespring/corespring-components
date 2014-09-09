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

      /**
       * Updates the provided element's checked property to be 'checked' if not defined, otherwise defines it as
       * 'checked'.
       */
      function toggleCheckbox(scope, element) {
        var isChecked = angular.isDefined(element.attr('checked'));
        if (isChecked) {
          element.removeAttr('checked');
        } else {
          element.attr('checked', 'checked');
        }

        updateChecked(scope, element);
      }

      function updateChecked(scope, element) {
        scope.checked = element.attr('checked') === 'checked';
      }

      var ngModelLink = function(scope, element, attr, ctrl) {
        var trueValue = attr.ngTrueValue,
          falseValue = attr.ngFalseValue;

        trueValue = (!angular.isString(trueValue)) ? true : trueValue;
        falseValue = (!angular.isString(falseValue)) ? false : falseValue;

        element.on('click', function() {
          scope.$apply(function() {
            toggleCheckbox(scope, element);
            ctrl.$setViewValue(element.attr('checked') === 'checked');
            scope.checked = element.attr('checked') === 'checked';
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

      /**
       * This function emulates the functions of a regular checkbox, by toggling when it's clicked and updating the
       * model's attributes to reflect that it has been checked.
       */
      var simulateNativeToggle = function(scope, element, attr) {
        attr.$observe('checked', function() {
          scope.checked = !!element.attr('checked');
        });
        element.on('click', function() {
          scope.$apply(function() {
            toggleCheckbox(scope, element);
          });
        });
      };

      return {
        replace: true,
        restrict: 'E',
        transclude: true,
        require: ['?ngModel'],
        link: function(scope, element, attr, ctrls) {
          if (ctrls[0]) {
            ngModelLink(scope, element, attr, ctrls[0]);
          } else {
            simulateNativeToggle(scope, element, attr);
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