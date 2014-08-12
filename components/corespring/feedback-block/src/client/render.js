var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          console.log("FB block: ", dataAndSession);
        },

        getSession: function() {
          return {
            answers: "ok"
          };
        },

        setResponse: function(response) {
          console.log("FB response: ", response);
          scope.correctClass = response.correctness;
          scope.feedback = response.feedback;
          this.updateVisibility();
        },

        setMode: function(newMode) {},

        reset: function() {
          scope.correctClass = scope.feedback = undefined;
        },

        isAnswerEmpty: function() {},

        answerChangedHandler: function(callback) {},

        editable: function(e) {
          scope.isEditable = e;
          this.updateVisibility();
        },

        updateVisibility : function(){
          scope.isVisible = scope.feedback && !scope.isEditable;
        }
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };


    def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: [
        '<div class="view-feedback-container" ng-show="isVisible" ><div class="view-feedback {{correctClass}}" ng-bind-html-unsafe="feedback"></div></div>'
      ].join("")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
