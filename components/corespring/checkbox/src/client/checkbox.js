exports.framework = "angular";
exports.directive = {
  name: "checkbox",
  directive: [
    function() {

      function link($scope) {
      }

      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        link: link,
        scope: {
          model: '=',
          value: '='
        },
        template: [
          '<div class="checkbox">',
          '  <label>',
          '    <div class="checkbox-toggle" ng-class="{\'checked\': model}" ng-click="switch($event)"/>',
          '    <input type="checkbox" ng-model="model" /><span class="label-text" ng-transclude/>',
          '  </label>',
          '</div>'
        ].join("\n")

      };
    }
  ]
};