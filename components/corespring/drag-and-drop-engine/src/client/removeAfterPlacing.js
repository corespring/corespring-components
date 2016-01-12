var removeAfterPlacing = [
  function() {

    "use strict";
    return {
      scope: true,
      restrict: 'AE',
      link: function ($scope, $element, $attrs) {
        var togglingIndividualChoice = false;
        var choiceKey = $attrs.choices || 'fullModel.model.choices';

        $scope.config = $scope.config || {};

        function choices() {
          function getProp(obj, desc) {
            var arr = desc.split(".");
            while (arr.length && (obj = obj[arr.shift()])) {}
            return obj;
          }
          return getProp($scope, choiceKey);
        }

        $scope.$watch(choiceKey, function() {
          togglingIndividualChoice = true;
          $scope.config.removeAllAfterPlacing = _.find(choices(), function(choice) {
            return (choice.moveOnDrag !== true);
          }) === undefined;
        }, true);

        $scope.$watch('config.removeAllAfterPlacing', function() {
          if (!togglingIndividualChoice) {
            if ($scope.config.removeAllAfterPlacing) {
              _.each(choices(), function(choice) {
                choice.moveOnDrag = true;
              });
            } else {
              _.each(choices(), function(choice) {
                choice.moveOnDrag = false;
              });
            }
          }
          togglingIndividualChoice = false;
        });
      },
      template: [
        '<checkbox ng-model="config.removeAllAfterPlacing" class="control-label">',
        '  Remove <strong>all</strong> tiles after placing',
        '</checkbox>'
      ].join('\n')
    };
  }
];


exports.framework = "angular";
exports.directive = {
  name: "removeAfterPlacing",
  directive: removeAfterPlacing
};
