var main = [
  '$sce',
  '$timeout',
  'KhanUtil',
  function($sce, $timeout, KhanUtilService) {
    var link = function(scope, element, attrs) {
      return function(scope, element, attrs) {
        scope.containerBridge = {
          setDataAndSession: function(dataAndSession) {
            scope.session = dataAndSession.session || {};
            scope.isVisible = false;
            var defaultPlayerDimensions = [600, 450],
                arrowFillColor = "#9ED343",
                $player = element.closest('.corespring-player');
            $player = $player.length ? $player : element.closest('.player-body');
            var player = $player.length ? $player[0] : null;
            // The $timeout is required due to player size changes during render
            $timeout(function() {
              if (player) {
                defaultPlayerDimensions[0] = $player.width();
                defaultPlayerDimensions[1] = $player.height();
              }
              var graphie = KhanUtilService.KhanUtil.createGraphie(element.find('.cs-protractor-widget')[0]),
                  scale = [40, 40],
                  range = [
                    [0, defaultPlayerDimensions[0] / scale[0]],
                    [0, defaultPlayerDimensions[1] / scale[1]]
                  ];
              graphie.init({
                range: range,
                scale: scale
              });
              graphie.addMouseLayer();
              var protractor = graphie.protractor([6, 4], arrowFillColor);
            }, 100);
          },
          getSession: function() {return {};},
          setResponse: function(response) {},
          setMode: function(newMode) {},
          reset: function() {},
          resetStash: function() {},
          isAnswerEmpty: function() { return false;},
          editable: function(editable) {},
          answerChangedHandler: function() {}
        };

        function toggleVisibility() {
          scope.isVisible = !scope.isVisible;
        }

        scope.toggleVisibility = toggleVisibility;
        scope.$emit('registerComponent', attrs.id, scope.containerBridge);
      };
    };

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [
        '<div class="cs-protractor">',
        '  <div class="cs-protractor-toggle" ng-class="{visible: isVisible}" ng-click="toggleVisibility()" title="Click to {{isVisible ? \'hide\' : \'show\'}}"></div>',
        '  <div class="cs-protractor-widget" ng-show="isVisible"></div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
