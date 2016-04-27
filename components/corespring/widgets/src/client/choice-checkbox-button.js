var checkboxButton = [
  function() {
    return {
      scope: {
        checkboxButtonState: "@",
        checkboxButtonChoice: "="
      },
      template: [
        '<div class="choice-checkbox-button" ng-class="{hasFeedback: feedback}">',
        '  <div class="choice-icon-holder" >',
        '    <choice-icon class="animate-show icon" ng-class="active" shape="box" key="selected" ng-show="active == \'ready\' || active == \'selected\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="box" key="muted" ng-show="active == \'muted\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="box" key="selected-disabled" ng-show="active == \'selectedDisabled\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="box" key="correct" ng-show="active == \'correct\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="box" key="correct" ng-show="active == \'correctUnselected\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="box" key="incorrect" ng-show="active == \'incorrect\'"></choice-icon>',
        '  </div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {
        console.log('linking cb');
        $scope.active = 'ready';

        $attrs.$observe('checkboxButtonState', function(val) {
          if ($scope.active === val)  return;
          console.log("REREING", val);
          if (_(['selected', 'selectedDisabled', 'correct', 'incorrect', 'muted', 'correctUnselected']).contains(val)) {
            $scope.active = val;
            if (val === 'correctUnselected') {
              $scope.feedback = {
                correctness: 'correct',
                feedback: $scope.checkboxButtonChoice.feedback
              };
            } else {
              $scope.feedback = undefined;
            }
          } else {
            $scope.active = 'ready';
          }
        });
      }
    };
  }
];

exports.framework = "angular";
exports.directive = {
  name: 'choiceCheckboxButton',
  directive: checkboxButton
};
