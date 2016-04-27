var radioButton = [
  function() {
    return {
      scope: {
        radioButtonState: "@",
        radioButtonChoice: "="
      },
      template: [
        '<div class="choice-radio-button" ng-class="{hasFeedback: feedback}">',
        '  <div class="choice-icon-holder" >',
        '    <choice-icon class="animate-show icon" ng-class="active" shape="radio" key="selected" ng-show="active == \'ready\' || active == \'selected\'"></choice-icon>',
        '    <choice-icon class="animate-hide icon" shape="radio" key="muted" ng-show="active == \'muted\'"></choice-icon>',
        '    <choice-icon class="animate-hide icon" shape="radio" key="selected-disabled" ng-show="active == \'selectedDisabled\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="radio" key="correct" ng-show="active == \'correct\' || active == \'correctUnselected\'"></choice-icon>',
        '    <choice-icon class="animate-show icon" shape="radio" key="incorrect" ng-show="active == \'incorrect\'"></choice-icon>',
        '  </div>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {
        $scope.active = 'ready';

        $attrs.$observe('radioButtonState', function(val) {
          if (_(['selected', 'selectedDisabled', 'correct', 'incorrect', 'muted', 'correctUnselected']).contains(val)) {
            $scope.active = val;
            if (val === 'correctUnselected') {
              $scope.feedback = {
                correctness: 'correct',
                feedback: $scope.radioButtonChoice.feedback
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
  name: 'choiceRadioButton',
  directive: radioButton
};
