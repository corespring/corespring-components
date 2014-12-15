var main = [
  '$sce', '$log',

  function($sce, $log) {
    var def;

    var link = function(scope, element, attrs) {

      scope.containerBridge = {

        setDataAndSession: function(dataAndSession) {
          console.log("FB block: ", dataAndSession);
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
          scope.isVisible = angular.isString(scope.feedback) && scope.feedback.length > 0 && !scope.isEditable;
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
        '<div class="view-feedback-container" ng-show="isVisible" >',
        '  <div class="panel panel-default feedback-panel {{correctClass}}">',
        '    <div class="panel-heading">&nbsp;</div>',
        '    <div class="panel-body">',
        '      <span type="success" ng-bind-html-unsafe="feedback"></span>',
        '    </div>',
        '  </div>',

        '  <div class="view-feedback {{correctClass}}" ng-bind-html-unsafe="feedback"></div>',
        '</div>'
      ].join("")
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;
