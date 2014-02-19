var tabs = [
    '$timeout', '$log',
  function($timeout, $log) {

    var controllerFn = function($scope, $element, $attrs) {

      var _this = this;

      if ($attrs.ngShow) {
        $scope.$watch($attrs.ngShow, function(newValue, oldValue) {
          _this.tabsAreVisible = newValue;
        });
      } else {
        this.tabsAreVisible = true;
      }

      $scope.tabs = [];

      $scope.$watch('tabs.length', function(tabsL, oldL) {
        if (tabsL > 0 && tabsL < oldL) {
          if ($scope.tabs.indexOf($scope.selectedTab === -1)) {
            $scope.selectTab($scope.tabs[Math.max($scope.selectedIdx - 1, 0)]);
          }
        }
      });


      $scope.selectTab = function(tab, $event) {

        if (!tab) {
          return;
        }

        for (var i = 0; i < $scope.tabs.length; i++) {
          $scope.tabs[i].selected(false);
        }

        $timeout(function() {
          tab.selected(true);
        });

        $scope.selectedTab = tab;

        $scope.selectedIdx = $scope.tabs.indexOf(tab);

        if ($scope.onTabSelect != null) {
          $scope.onTabSelect(tab);
        }

        if ($event) {
          $event.preventDefault();
          $event.stopPropagation();
        }
      };

      $scope.changeTab = function(index) {
        try {
          $scope.selectTab($scope.tabs[index]);
        } catch (e) {
          $log.error("could not change tab, probably array out of bounds");
          throw e;
        }
      };

      this.addTab = function(tab, index) {
        $scope.tabs.push(tab);
        if ($scope.tabs.length === 1) {
          $scope.selectTab(tab);
        }
      };

      this.removeTab = function(tab) {
        $timeout(function() {
          $scope.tabs.splice($scope.tabs.indexOf(tab, 1));
        });
      };

      this.nextTab = function() {
        var newIdx;
        newIdx = $scope.selectedIdx + 1;
        $scope.changeTab(newIdx);
      };

      this.previousTab = function() {
        var newIdx;
        newIdx = $scope.selectedIdx - 1;
        $scope.changeTab(newIdx);
      };
    };

    return {
      restrict: 'EA',
      transclude: true,
      controller: controllerFn,
      template: ['<div class="tab-panel">',
                    '<div class="tabs">',
                    '<ul><li ng-repeat="tab in tabs" >',
                    '<a href="" ng-class="{active: tab.selected()}" ng-click="selectTab(tab, $event)">{{tab.title}}</a>',
                    '</li></ul></div><div class="tab-box" ng-transclude></div></div>'].join('')

    };
    }
  ];

exports.framework = 'angular';
exports.directive = {
  name: "corespringTabs",
  directive: tabs
};
