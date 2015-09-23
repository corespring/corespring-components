var main = [
  '$sce',
  function($sce) {
    var link = function(scope, element, attrs) {

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

      function answerChangedHandler(callback) {}

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
        '  <div ng-show="model.config.label" ng-bind-html-unsafe="model.config.label"></div>',
        '  <div class="select-text-content" ng-bind-html-unsafe="model.config.xhtml"></div>',
        '</div>'
      ].join("\n")
    };
  }
];

exports.framework = 'angular';
exports.directive = main;
