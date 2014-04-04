var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {


      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          console.log("Image, setting model: ", dataAndSession);
          scope.imageUrl = dataAndSession.data.imageUrl;
        },

        getSession: function() {
          return {
            answers: ""
          };
        },

        setResponse: function(response) {},

        setMode: function(newMode) {},

        reset: function() {},

        isAnswerEmpty: function() {},

        answerChangedHandler: function(callback) {},

        editable: function(e) {}
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };


    def = {
      scope: {},
      restrict: 'E',
      replace: true,
      link: link,
      template: ['<div class="view-image"><img ng-src="{{imageUrl}}"></img></div>'].join("")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
