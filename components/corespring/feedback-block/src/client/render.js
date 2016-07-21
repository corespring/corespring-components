var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          console.log("FB-block setDataAndSession: ", dataAndSession);
        },

        setResponse: function(response) {
          console.log("FB-block setResponse: ", response);
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

        setPlayerSkin: function(skin) {
          scope.iconset = skin.iconSet;
        },

        editable: function(e) {
          scope.isEditable = e;
          this.updateVisibility();
        },

        getSession: function() {
          return {
          };
        },

        updateVisibility : function(){
          scope.isVisible = angular.isString(scope.feedback) && scope.feedback.length > 0 && !scope.isEditable;
        }
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge, element[0]);
    };


    def = {
      scope: {},
      restrict: 'AE',
      replace: true,
      link: link,
      template: [
        '<div class="view-feedback-container" ng-show="isVisible" >',
        '  <div feedback="feedback" correct-class="{{correctClass}}" icon-set="{{iconset}}"></div>',
        '</div>'
      ].join("")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
