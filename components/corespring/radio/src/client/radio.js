exports.framework = "angular";
exports.directive = {
  name: 'radio',
  directive: [
    '$rootScope',
    function($rootScope) {

      var Radio = {
        CheckedEvent: 'radio.checked',
        check: function(element) {
          element.attr('checked', 'checked');
          $('.radio-toggle', element).addClass('checked');
        },
        uncheck: function(element) {
          element.removeAttr('checked');
          $('.radio-toggle', element).removeClass('checked');
        },
        isChecked: function(element) {
          return element.attr('checked') === 'checked';
        },
        isEnabled: function(element) {
          return element.attr('disabled') !== 'disabled';
        },
        shouldCheck: function(element) {
          return (this.isEnabled(element) && !(this.isChecked(element)));
        },
        enable: function(element) {
          element.removeAttr('disabled');
          $('.radio-toggle', element).removeClass('disabled');
        },
        disable: function(element) {
          element.attr('disabled', 'disabled');
          $('.radio-toggle', element).addClass('disabled');
        }
      };

      function ngModelLink(scope, element, attr, ctrl) {
        element.click(function() {
          if (Radio.shouldCheck(element)) {
            Radio.check(element);
            scope.$apply(function() {
              ctrl.$setViewValue(attr.value);
            });
          }
        });

        scope.$watch(attr.ngModel, function() {
          if (!angular.isDefined(ctrl.$viewValue) || ctrl.$viewValue !== attr.value) {
            Radio.uncheck(element);
          } else if (ctrl.$viewValue === attr.value) {
            Radio.check(element);
          }
        });

      }

      function doNative(scope, element, attr) {
        element.click(function() {
          if (Radio.shouldCheck(element)) {
            attr.$set('checked', 'checked');
          }
        });

        scope.$on(Radio.CheckedEvent, function(event, value) {
          if (element.attr('value') !== value) {
            Radio.uncheck(element);
          }
        });

        attr.$observe('checked', function() {
          if (Radio.isChecked(element)) {
            Radio.check(element);
            $rootScope.$broadcast(Radio.CheckedEvent, element.attr('value'));
          } else {
            Radio.uncheck(element);
          }
        });

      }

      return {
        replace: true,
        restrict: 'E',
        transclude: true,
        priority: 90,
        require: ['?ngModel'],
        link: function(scope, element, attr, ctrls) {
          if (Radio.isChecked(element)) {
            Radio.check(element);
          }
          if (!Radio.isEnabled(element)) {
            Radio.disable(element);
          }
          if (ctrls[0]) {
            ngModelLink(scope, element, attr, ctrls[0]);
          } else {
            doNative(scope, element, attr);
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