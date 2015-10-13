var main = [
  '$sce',
  '$timeout',
  function($sce, $timeout) {

    var link = function(scope, element, attrs) {

      var blastOptions = {
        customClass: 'token'
      };

      var log = console.log.bind(console,'[select-text]');

      scope.containerBridge = {
        setDataAndSession: setDataAndSession,
        getSession: getSession,
        setResponse: setResponse,
        setMode: setMode,
        reset: reset,
        isAnswerEmpty: isAnswerEmpty,
        answerChangedHandler: answerChangedHandler,
        editable: editable
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);

      function setDataAndSession(dataAndSession) {
        log("Setting data for Select Text: ", dataAndSession);
        scope.model = dataAndSession.data.model;
        $timeout(function() {
          blastOptions.delimiter = scope.model.config.selectionUnit;
          var $theContent = element.find('.select-text-content');
          $theContent.blast(blastOptions);
          $theContent.off('click', '.token');
          $theContent.on('click', '.token', function() {
            var $token = $(this);
            var index = $theContent.find('.token').index($token);
            $token.toggleClass('selected');
          });
        }, 100);
      }

      function getSession() {
        return {};
      }

      function setResponse(response) {
        log("Setting response", response);
        scope.feedback = response.feedback.message;
        scope.correctClass = response.correctClass;
      }

      function setMode(newMode) {}

      function reset() {
        scope.feedback = undefined;
        scope.correctClass = undefined;
      }

      function isAnswerEmpty() {
        return _.isEmpty(getSession().answers);
      }

      function answerChangedHandler(callback) {
        scope.$watch("selectedTokens", function(newValue, oldValue) {
          if (newValue !== oldValue) {
            callback();
          }
        }, true);
      }

      function editable(e) {
        scope.editable = e;
      }
    };

    return {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: [
        '<div class="cs-select-text">',
        '  <div class="select-text-label" ng-show="model.config.label" ng-bind-html-unsafe="model.config.label"></div>',
        '  <div class="select-text-content" ng-bind-html-unsafe="model.config.xhtml"></div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
