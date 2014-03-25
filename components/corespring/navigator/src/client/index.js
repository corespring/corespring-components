var main = ['$log','$timeout',
  function($log, $timeout) {

    var link = function(scope, element, attrs) {
      scope.navClosed = false;

      scope.toggleNav = function() {
        scope.navClosed = !scope.navClosed;
      };
    };

    var controllerFn = function($scope, $element, $attrs) {

      var _this = this;

      $scope.panels = [];

      $scope.$watch('panels.length', function(panelsL, oldL) {
        if (panelsL > 0 && panelsL < oldL) {
          if ($scope.panels.indexOf($scope.selectedPanel === -1)) {
            $scope.selectPanel($scope.panels[Math.max($scope.selectedIdx - 1, 0)]);
          }
        }
      });


      $scope.selectPanel = function(panel, $event) {

        if (!panel) {
          return;
        }

        for (var i = 0; i < $scope.panels.length; i++) {
          $scope.panels[i].selected(false);
        }

        $timeout(function() {
          panel.selected(true);
        });

        $scope.selectedPanel = panel;

        $scope.selectedIdx = $scope.panels.indexOf(panel);

        if ($scope.onTabSelect != null) {
          $scope.onTabSelect(panel);
        }

        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }
      };

      $scope.changePanel = function(index) {
        try {
          $scope.selectPanel($scope.panels[index]);
        } catch (e) {
          $log.error("could not change tab, probably array out of bounds");
          throw e;
        }
      };

      this.addPanel = function(panel, index) {
        $scope.panels.push(panel);
        if ($scope.panels.length === 1) {
          $scope.selectPanel(panel);
        }
      };

      this.removePanel = function(panel) {
        $timeout(function() {
          $scope.panels.splice($scope.panels.indexOf(panel, 1));
        });
      };

    };


    return {
      restrict: 'EA',
      transclude: true,
      controller: controllerFn,
      link: link,
      template: [
        '<div class="navigator" ng-class="{\'nav-closed\':navClosed==true}">',
        '  <div class="nav-container">',
        '    <div class="nav-left-panel">',
        '      <ul class="nav nav-stacked">',
        '        <li ng-repeat="panel in panels" >',
        '          <a href="" ng-class="{active: panel.selected()}" ng-click="selectPanel(panel, $event)">{{panel.title}}</a>',
        '        </li>',
        '      </ul>',
        '    </div>',
        '  </div>',
        '  <div style="position: absolute; left: 5px; top: 5px"><a ng-click="toggleNav()"><button class="btn btn-nav-toggle btn-default"><i class="fa fa-bars"></i></button></a></div>',
        '  <div class="config-panel-body" ng-transclude>',
        '  </div>',
        '</div>'
      ].join('')
    };
  }
];

var navigatorPanel = ['$log',
  function($log) {

    var link = function(scope, element, attrs, container) {
      var tab = {
        title: attrs.navigatorPanel,

        selected: function(newVal) {
          if (newVal == null) {
            //treat it as a getter
            return scope.selected;
          }
          //treat it as a setter
          scope.selected = newVal;
        }
      };

      container.addPanel(tab);

      scope.$on('$destroy', function() {
        container.removePanel(tab);
      });
    };

    return {
      link: link,
      scope: {},
      restrict: 'AE',
      require: '^navigator',
      replace: true,
      transclude: true,
      template: "<div ng-class=\"{active:selected}\" ng-show=\"selected\" ng-transclude></div>"
    };
  }];


exports.framework = 'angular';
exports.directives = [
  {
    directive: function() {
    }
  },
  {
    name: 'navigator',
    directive: main
  },
  {
    name: 'navigatorPanel',
    directive: navigatorPanel
  }
];
