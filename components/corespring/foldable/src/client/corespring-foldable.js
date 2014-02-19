var directive = [
    '$timeout', '$log', 'ComponentRegister',
  function($timeout, $log, ComponentRegister) {

    var linkFn = function(scope, element) {

      scope.folded = true;

      var containedIds = [];
      $(element).find("[id]").each(function(idx, e) {
        containedIds.push($(e).attr("id"));
      });

      var isComplete = function() {
        return !(_.reduce(containedIds, function(memo, elem) {
          return memo || ComponentRegister.isAnswerEmpty(elem);
        }, ComponentRegister.isAnswerEmpty(containedIds[0])));
      };

      var isEmpty = function() {
        return _.reduce(containedIds, function(memo, elem) {
          return memo && ComponentRegister.isAnswerEmpty(elem);
        }, ComponentRegister.isAnswerEmpty(containedIds[0]));
      };


      scope.$watch(
        function() {
          return isComplete() + "," + isEmpty();
        },
        function(n, o) {
          scope.isComplete = isComplete();
          scope.isEmpty = isEmpty();
        }
      );

      scope.containerBridge = {
        setDataAndSession: function(dataAndSession) {
          $log.debug("foldable setDataAndSession", dataAndSession);
        }
      };

    };

    return {
      restrict: 'A',
      transclude: true,
      link: linkFn,
      scope: {},
      template: [
          "<div class='view-foldable'>",
          "<span class='toggle-icon' ng-click='folded = !folded'><img src='/assets/images/component.png'></img></span>",
          "<div>Complete: {{isComplete}} Empty: {{isEmpty}}</div>",
          "<div ng-hide='folded' ng-transclude></div>",
          "</div>"
        ].join("")
    };
    }
  ];

exports.framework = 'angular';
exports.directive = {
  name: "corespringFoldable",
  directive: directive
};
