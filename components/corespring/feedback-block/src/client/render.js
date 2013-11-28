var main = [
  '$sce', '$log',

  function ($sce, $log) {
    var def;

    var link = function (scope, element, attrs) {


      scope.containerBridge = {

        setDataAndSession: function (dataAndSession) {
          console.log("FB block: ", dataAndSession);
        },

        getSession: function () {
          return {
            answers: "ok"
          }
        },

        setResponse: function (response) {
          console.log("FB response: ", response);
          scope.feedback = response.feedback.correct;
        },

        setMode : function(newMode) {
        },

        reset : function(){
        },

        isAnswerEmpty: function(){
        },

        answerChangedHandler: function(callback){
        },

        editable: function(e){
        }
      };

      scope.$emit('registerComponent', attrs.id, scope.containerBridge);
    };


    def = {
      scope: {},
      restrict: 'E',
      replace: true,
      link: link,
      template: [ '<div>{{feedback}}</div>' ]
    };

    return def;
  }
];

exports.framework = 'angular';
exports.directive = main;

