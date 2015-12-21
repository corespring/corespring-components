var main = [
  '$sce',
  function($sce) {

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: function($scope, $element, $attrs) {

        function setSrc(passageId) {
          $scope.passageRoute = $sce.trustAsResourceUrl('/api/v2/passages/' + passageId);
        }

        var addEmptyFunctions = function(obj, fns) {
          _.each(fns, function(fn) {
            obj[fn] = function() {
            };
          });
        };

        $scope.containerBridge = {

          setDataAndSession: function(dataAndSession) {
            $scope.displayed = dataAndSession.data.model.config.displayed !== false;
            setSrc(dataAndSession.data.id);
          }

        };

        addEmptyFunctions($scope.containerBridge, ['setResponse', 'setMode', 'reset', 'answerChangedHandler', 'editable', 'getSession', 'isAnswerEmpty']);

        $scope.$emit('registerComponent', $attrs.id, $scope.containerBridge);
      },
      template: [
        '<div class="passage-frame">',
        '  <iframe ng-src="{{passageRoute}}" ng-if="passageRoute && displayed"></iframe>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
