## Corespring `<radio/>` Directive

A substitute for `input[type=radio]` that can be styled across all browsers.

### Directive Info

This directive executes at priority level 0.

**NOTE**: Although this directive operates the same way as `input[type=radio]`, you may *not* alter the `checked` and
`disabled` attributes of this directive outside of an Angular context. If these attributes are set using, for example,
jQuery's `$.attr` method, the changes will not be picked up by Angular, and the directive will not update. This is a
known issue with no reasonable workaround for 100% compatibility (although an improvement may be to add
`MutationObserver` support for evergreen browsers, but this will not work for IE10 and under).

---

### Usage

    <radio
      ng-model=""
      value=""
      [name=""]
      [ng-change=""]
      ng-value="">


### Arguments

| Param                 | Type   | Details
|-----------------------|--------|--------
| ngModel               | string | Assignable angular expression to data-bind to.
| value                 | string | The value to which the expression should be set when selected.
| name *(optional)*     | string | Property name of the form under which the control is published.
| ngChange *(optional)* | string | Angular expression to be executed when input changes due to user interaction with the input element.
| ngValue               | string | Angular expression which sets the value to which the expression should be set when selected.


### Example

    <script>
      angular.module('radioExample', [])
        .controller('ExampleController', ['$scope', function($scope) {
          $scope.color = 'blue';
          $scope.specialValue = {
            "id": "12345",
            "value": "green"
          };
        }]);
    </script>
    <form name="myForm" ng-controller="ExampleController">
      <ul>
        <li><radio ng-model="color" value="red">Red</radio></li>
        <li><radio ng-model="color" ng-value="specialValue">Green</radio></li>
        <li><radio ng-model="color" value="blue">Blue</radio></li>
      </ul>
      <tt>color = {{color | json}}</tt><br/>
     </form>
     Note that `ng-value="specialValue"` sets radio item's value to be the value of `$scope.specialValue`.
