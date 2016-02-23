var removeAfterPlacing = [
  function() {

    "use strict";

    return {
      scope: true,
      restrict: 'AE',
      link: link,
      template: [
        '<checkbox ng-model="config.removeAllAfterPlacing" class="control-label">',
        '  Remove <strong>all</strong> tiles after placing',
        '</checkbox>'
      ].join('\n')
    };

    function link(scope, $element, $attrs) {
      var togglingIndividualChoice = false;
      var choiceKey = $attrs.choices || 'fullModel.model.choices';

      scope.config = scope.config || {};

      scope.$watch(choiceKey, watchChoices, true);
      scope.$watch('config.removeAllAfterPlacing', watchRemoveAllAfterPlacing);

      //---------------------------------------

      function choices() {
        return getProp(scope, choiceKey);
      }

      function getProp(obj, desc) {
        var arr = desc.split(".");
        while (arr.length && (obj = obj[arr.shift()])) {}
        return obj;
      }

      function watchChoices(newValue, oldValue) {
        scope.config.removeAllAfterPlacing = _.every(newValue, function(choice) {
          return choice.moveOnDrag === true;
        });
      }

      function watchRemoveAllAfterPlacing(newValue, oldValue) {
        _.each(choices(), function(choice) {
          choice.moveOnDrag = newValue;
        });
      }
    }
  }
];


exports.framework = "angular";
exports.directive = {
  name: "removeAfterPlacing",
  directive: removeAfterPlacing
};