var main = [
  '$sce',
  '$timeout',
  'KhanUtil',
  function($sce, $timeout, KhanUtilService) {
    var link = function(scope, element, attrs) {
      scope.graphie = null;
      scope.ruler = null;

      var addEmptyFunctions = function(obj, fns) {
        _.each(fns, function(fn) {
          obj[fn] = function() {};
        });
      };

      scope.containerBridge = {
        setDataAndSession: function(dataAndSession) {
          scope.session = dataAndSession.session || {};
          scope.isVisible = false;

          var rulerConfig = dataAndSession.data.model.config;
          var defaultPlayerDimensions = [600, 450];
          var arrowFillColor = "#9ED343";
          var $player = element.closest('.corespring-player');
          $player = $player.length ? $player : element.closest('.player-body');
          var player = $player.length ? $player[0] : null;
          var playerWidth = 0;
          var playerHeight = 0;
          var scale = [40, 40];
          var range = null;
          var $rulerWidget = null;

          // The $timeout is required due to player size changes during render
          $timeout(function() {
            if (player) {
              playerWidth = $player.width();
              playerHeight = $player.height();
              defaultPlayerDimensions[0] = playerWidth > defaultPlayerDimensions[0] ? playerWidth : defaultPlayerDimensions[0];
              defaultPlayerDimensions[1] = playerHeight > defaultPlayerDimensions[1] ? playerHeight : defaultPlayerDimensions[1];
            }
            range = [
              [0, defaultPlayerDimensions[0] / scale[0]],
              [0, defaultPlayerDimensions[1] / scale[1]]
            ];
            $rulerWidget = element.find('.cs-ruler-widget');
            if (scope.graphie) {
              $rulerWidget.empty();
              delete scope.graphie;
            }
            scope.graphie = KhanUtilService.KhanUtil.createGraphie($rulerWidget[0]);
            scope.graphie.init({
              range: range,
              scale: scale
            });
            scope.graphie.addMouseLayer();
            if (scope.ruler) {
              scope.ruler.remove();
              delete scope.ruler;
            }
            scope.ruler = scope.graphie.ruler({
              center: [
                (range[0][0] + range[0][1]) / 2,
                (range[1][0] + range[1][1]) / 2
              ],
              label: rulerConfig.label,
              pixelsPerUnit: parseInt(rulerConfig.pixelsPerUnit, 10),
              ticksPerUnit: parseInt(rulerConfig.ticks, 10),
              units: parseInt(rulerConfig.length, 10),
              movablePointColor: arrowFillColor
            });
          }, 100);
        }
      };

      addEmptyFunctions(scope.containerBridge, ['answerChangedHandler', 'editable', 'getSession', 'isAnswerEmpty', 'reset', 'setMode', 'setResponse', 'setInstructorData']);

      function toggleVisibility() {
        scope.isVisible = !scope.isVisible;
      }

      scope.toggleVisibility = toggleVisibility;
      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: [
        '<div class="cs-ruler">',
        '  <div class="cs-ruler-toggle" ng-class="{visible: isVisible}" ng-click="toggleVisibility()" title="Click to {{isVisible ? \'hide\' : \'show\'}}"></div>',
        '  <div class="cs-ruler-widget" ng-show="isVisible"></div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
