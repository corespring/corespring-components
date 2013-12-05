var tab = [
    function() {
      var linkFn, nextTab;
      nextTab = 0;
      linkFn = function(scope, elm, attrs, container) {
        var tab;
        tab = {
          title: attrs['title'],
          selected: function(newVal) {
            if (newVal == null) {
              return scope.selected;
            }
            return scope.selected = newVal;
          }
        };
        container.addTab(tab);
        return scope.$on('$destroy', function() {
          return container.removeTab(tab);
        });
      };
      return {
        restrict: 'EA',
        transclude: true,
        require: '^corespringTabs',
        link: linkFn,
        scope: true,
        template: "<div class=\"paragraph-style\" ng-class=\"{active:selected}\" ng-show=\"selected\" ng-transclude></div>"
      };
    }
  ];

exports.framework = 'angular';
exports.directive = { name: "corespringTab", directive: tab };