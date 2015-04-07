exports.framework = "angular";
exports.directive = {
  name: "collapsablePanel",
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
        scope: {
          collapsablePanelTitle: "@"
        },
        template: [
          '<div class="panel panel-default collapsable-panel">',
          '  <div class="panel-heading" ng-click="toggle()" data-toggle="collapse" href="#collapsePanel">',
          '    <h4 class="panel-title">',
          '      <a  class="">',
          '        <span class="icon"><i class="fa fa-{{isOpen ? \'minus\' : \'plus\'}}-circle"></i></span>',
          '        {{collapsablePanelTitle}}',
          '      </a>',
          '    </h4>',
          '  </div>',
          '  <div id="collapsePanel" class="panel-collapse collapse">',
          '    <div class="panel-body" ng-transclude>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')
      };
    }
  ]
};
