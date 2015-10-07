/* jshint evil: true */
var main = ['$compile', '$rootScope', '$timeout', "LineUtils",
  function($compile, $rootScope, $timeout, LineUtils) {

    var lineUtils = new LineUtils();

    return {
      template: template(),
      restrict: 'AE',
      scope: true,
      link: link
    };

    function link(scope, element, attrs) {

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {

        },

        getSession: function() {
          return {
            answers: scope.points
          };
        },

        setResponse: function(response) {
          if (!response) {
            return;
          }
        },

        setMode: function(newMode) {},

        reset: function() {},

        isAnswerEmpty: function() {
          return false;
        },

        answerChangedHandler: function(callback) {

        },

        editable: function(e) {
          scope.editable = e;
        }

      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    }

    function template() {
      return [
        "<div class='line-interaction-view'>",
        "  Multiple line component...<br />",
        "  Multiple line component...<br />",
        "  Multiple line component...",
        "</div>"
      ].join("");
    }
  }
];

exports.framework = 'angular';
exports.directives = [
  {
    directive: main
  }
];