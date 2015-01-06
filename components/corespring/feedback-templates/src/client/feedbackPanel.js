exports.framework = "angular";
exports.directive = {
  name: "feedbackPanel",
  directive: [
    '$log',
    function($log) {

      return {
        link: function($scope, $element, $attrs) {
          $scope.isOpen = false;
          $scope.toggle = function() {
            $scope.isOpen = !$scope.isOpen;
          };
        },
        replace: true,
        transclude: true,
        template: [
          '<div class="panel panel-default feedback-panel-header">',
          '  <div class="panel-heading" ng-click="toggle()" data-toggle="collapse" href="#collapseFeedback">',
          '    <h4 class="panel-title">',
          '      <a  class="">',
          '        <span class="icon"><i class="fa fa-{{isOpen ? \'minus\' : \'plus\'}}-circle"></i></span>',
          '      Feedback',
          '      </a>',
          '    </h4>',
          '  </div>',
          '  <div id="collapseFeedback" class="panel-collapse collapse">',
          '    <div class="panel-body" ng-transclude>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')
      };
    }
  ]
};
