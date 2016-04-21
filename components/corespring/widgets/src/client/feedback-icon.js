var feedbackIcon = [
  function() {
    return {
      scope: {
        feedbackIconChoice: "=",
        feedbackIconClass: "@",
        feedbackIconType: "@",
        feedbackIconSet: "@"
      },
      template: [
        '<div class="feedback-icon" feedback-popover="feedback" feedback-popover-state="state" viewport="#{{playerId}}">',
        '  <svg-icon ng-class="{hasFeedback: feedback.feedback}" key="{{iconKey()}}" shape="{{iconShape()}}" icon-set="{{iconSet()}}" text="{{feedback.feedback}}" open="{{state == \'open\' ? \'true\' : undefined}}"></svg-icon>',
        '</div>'
      ].join("\n"),
      link: function($scope, $element, $attrs) {

        $scope.$watch('feedbackIconChoice', updateView, true);
        $attrs.$observe('feedbackIconClass', updateView);
        $attrs.$observe('feedbackIconType', updateView);
        $attrs.$observe('feedbackIconSet', updateView);

        $scope.playerId = (function() {
          return $element.closest('.player-body').attr('id');
        })();

        $scope.iconKey = function() {
          var iconClass = $attrs.feedbackIconClass;
          if (/incorrect/gi.test(iconClass)) {
            return 'incorrect';
          }
          if (/correct/gi.test(iconClass)) {
            return 'correct';
          }
          return "empty";
        };

        $scope.iconShape = function() {
          var iconType = $attrs.feedbackIconType;
          return iconType === 'checkbox' ? 'square' : 'round';
        };

        $scope.iconSet = function() {
          return $attrs.feedbackIconSet;
        };


        function updateView() {
          if (_.isUndefined($scope.feedbackIconChoice) || _.isUndefined($scope.feedbackIconClass) || _.isUndefined($scope.feedbackIconType)) {
            return;
          }
          var correctness = _.result($scope.feedbackIconClass.match(/correct|incorrect|partial/), "0");
          var selected = $scope.feedbackIconClass.match(/selected/);
          var correctnessSelector = (correctness == 'correct' && selected) ? 'correctSelected' : correctness;

          $scope.feedback = (!$scope.feedbackIconChoice.feedback || correctnessSelector == 'correct' ) ? undefined : {
            correctness: correctness,
            feedback: $scope.feedbackIconChoice.feedback
          };

        }
      }
    }

  }
];


exports.framework = "angular";
exports.directive = {
  name: 'feedbackIcon',
  directive: feedbackIcon
};
