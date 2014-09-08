exports.framework = "angular";
exports.directive = {
  name: "checkbox",
  directive: [
    '$compile',
    function($compile) {

      // Attributes to be passed from containing <checkbox/> to <input type='checkbox'/> in rendered markup
      var attributes = ['ngModel', 'ngDisabled', 'ngChecked'];

      function dasher(str) {
        return str.replace(/([a-z][A-Z])/g, function (g) { return g[0] + '-' + g[1].toLowerCase() });
      }

      return {
        restrict: 'E',
        link : function (scope, element, attrs) {
          var attrStr = [];
          for (var i in attributes) {
            var key = attributes[i];
            var value = attrs[attributes[i]];
            if (value) {
              attrStr.push(dasher(key) + '=' + "'" + value + "'");
            }
          }
          var tmpl = [
            '<div class="checkbox">',
            '  <label>',
            '    <div class="checkbox-toggle" ng-class="{\'checked\': checked}"/>',
            '    <input type="checkbox" ' + attrStr.join(' ') + '/>',
            '  </label>',
            '</div>'
          ].join('');

          var compiled = $compile(tmpl)(scope);
          element.empty();
          element.append(compiled);
        }
      };
    }
  ]
};