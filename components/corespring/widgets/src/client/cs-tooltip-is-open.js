var def = function() {
  return {
    scope: {
      csTooltipIsOpen: "&",
      csTooltipTitle: "@"
    },
    link: function(scope, element) {
      var showTooltip = function() {
        element.tooltip({title: scope.csTooltipTitle, trigger: 'manual'}).tooltip('show');
      };
      element.focus(function() {
        if (scope.csTooltipIsOpen()) {
          showTooltip();
        }
      });
      element.blur(function() {
        element.tooltip('destroy');
      });
      scope.$watch(function() {
        return scope.csTooltipIsOpen();
      }, function(n) {
        var elem = element[0];
        var hasFocus = elem === document.activeElement && ( elem.type || elem.href );
        if (n && hasFocus) {
          showTooltip();
        } else {
          element.tooltip('destroy');
        }
      });
    }
  };
};


exports.framework = "angular";
exports.directive = {
  name: "csTooltipIsOpen",
  directive: def
};
