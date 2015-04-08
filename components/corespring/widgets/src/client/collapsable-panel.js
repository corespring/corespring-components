exports.framework = "angular";
exports.directive = {
  name: "collapsablePanel",
  directive: [
    '$log',
    function($log) {

      return {
        link: function($scope, $element, $attrs) {
          $scope.randomId = Math.floor(Math.random() * 1000);
          $scope.isOpen = false;
          $scope.toggle = function() {
            $scope.isOpen = !$scope.isOpen;
          };
          $scope.$watch('defaultState', function(n) {
             if (n) {
               $scope.isOpen = n === 'in';
             }
          });
        },
        replace: true,
        transclude: true,
        scope: {
          collapsablePanelTitle: "@",
          defaultState: "@collapsablePanelDefaultState"
        },
        template: [
          '<div class="panel panel-default collapsable-panel">',
          '  <div class="panel-heading" ng-click="toggle()" data-toggle="collapse" href="#collapsePanel{{randomId}}">',
          '    <h4 class="panel-title">',
          '      <a class="">',
          '        <span class="icon"><i class="fa fa-{{isOpen ? \'minus\' : \'plus\'}}-circle"></i></span>',
          '        {{collapsablePanelTitle}}',
          '      </a>',
          '    </h4>',
          '  </div>',
          '  <div id="collapsePanel{{randomId}}" class="panel-collapse collapse {{defaultState}}">',
          '    <div class="panel-body" ng-transclude>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')
      };
    }
  ]
};
