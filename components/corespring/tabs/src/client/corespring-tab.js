var tab = [

    function() {
    var linkFn = function(scope, elm, attrs, container) {

      var tab = {
        title: attrs.title,

        selected: function(newVal) {
          if (newVal == null) {
            //treat it as a getter
            return scope.selected;
          }
          //treat it as a setter
          scope.selected = newVal;
        }
      };

      container.addTab(tab);

      scope.$on('$destroy', function() {
        container.removeTab(tab);
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
exports.directive = {
  name: "corespringTab",
  directive: tab
};
