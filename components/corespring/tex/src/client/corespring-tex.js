var directive = function() {

  return {
    restrict: 'EA',
    compile: function(element, attrs) {
      var content = element.html();
      if (attrs.inline === "false") {
        element.html("$$" + content + "$$");
      } else {
        element.html("\\(" + content + "\\)");
      }
    }
  };
};

exports.framework = 'angular';
exports.directive = {
  name: "corespringTex",
  directive: directive
};
