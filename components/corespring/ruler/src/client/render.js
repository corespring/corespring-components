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
            scope.ruler = null;
            var rulerConfig = dataAndSession.data.model.config,
                defaultPlayerDimensions = [600, 450],
                arrowFillColor = "#9ED343",
                $player = element.closest('.corespring-player');
            $player = $player.length ? $player : element.closest('.player-body');
            var player = $player.length ? $player[0] : null;
            // The $timeout is required due to player size changes during render
            $timeout(function() {
              // if (player) {
              //   defaultPlayerDimensions[0] = $player.width();
              //   defaultPlayerDimensions[1] = $player.height();
              // }
              var graphie = KhanUtilService.KhanUtil.createGraphie(element.find('.cs-ruler-widget')[0]),
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
              if (scope.ruler) {
                scope.ruler.remove();
              }
              scope.ruler = graphie.ruler({
                center: [
                  (range[0][0] + range[0][1]) / 2,
                  (range[1][0] + range[1][1]) / 2
                ],
                label: rulerConfig.label,
                pixelsPerUnit: rulerConfig.pixelsPerUnit,
                ticksPerUnit: rulerConfig.ticks,
                units: rulerConfig.length,
                movablePointColor: arrowFillColor
              });
              element.find('.cs-ruler-widget').height(0).width(0); // Prevents the ruler container of blocking underlying content
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

        scope.toggleVisibility = toggleVisibility;
        scope.$emit('registerComponent', attrs.id, scope.containerBridge);

        function toggleVisibility() {
          scope.isVisible = !scope.isVisible;
        }
      };
    };

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link(),
      template: [
        '<div class="cs-ruler">',
        '  <div class="cs-ruler-toggle"><button class="btn btn-primary" ng-click="toggleVisibility()">{{isVisible ? "Hide" : "Show"}} ruler</button></div>',
        '  <div class="cs-ruler-widget" ng-show="isVisible"></div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
